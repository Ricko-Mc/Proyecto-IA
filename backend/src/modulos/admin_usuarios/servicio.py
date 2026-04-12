from typing import Any

from fastapi import HTTPException

from .esquemas import (
    AsignarRolPorEmailRequest,
    CrearUsuarioAdminRequest,
)
from ..auth.servicio import validar_roles
from ...utilidades.supabase_client import obtener_cliente_supabase, registrar_bitacora

class ServicioAdminUsuarios:
    def __init__(self):
        self.supabase = obtener_cliente_supabase()

    def _supabase_requerido(self) -> Any:
        if self.supabase is None:
            raise HTTPException(status_code=503, detail="Supabase no esta configurado en el servidor")
        return self.supabase

    def _validar_admin(self, roles_usuario: list[str]) -> None:
        validar_roles(roles_usuario, ["admin"])

    def _obtener_rol(self, nombre_rol: str) -> dict:
        cliente = self._supabase_requerido()
        respuesta = (
            cliente.table("rol")
            .select("id, nombre, descripcion")
            .eq("nombre", nombre_rol)
            .limit(1)
            .execute()
        )
        filas = respuesta.data or []
        if not filas:
            raise HTTPException(status_code=400, detail=f"Rol '{nombre_rol}' no existe")
        return filas[0]

    def _mapear_usuario_con_rol(self, fila: dict, roles_por_id: dict[int, str]) -> dict:
        rol_id = int(fila.get("id_rol") or 0)
        return {
            "id": fila.get("id"),
            "email": fila.get("email"),
            "nombre_completo": fila.get("nombre_completo") or "Usuario",
            "rol": roles_por_id.get(rol_id, "usuario"),
            "created_at": fila.get("created_at"),
            "last_seen": fila.get("last_seen"),
        }

    def listar_roles(self, roles_usuario: list[str]) -> list[dict]:
        self._validar_admin(roles_usuario)
        cliente = self._supabase_requerido()
        respuesta = cliente.table("rol").select("id, nombre, descripcion").order("id").execute()
        return respuesta.data or []

    def listar_usuarios(self, roles_usuario: list[str], email: str | None) -> list[dict]:
        self._validar_admin(roles_usuario)
        cliente = self._supabase_requerido()

        roles = cliente.table("rol").select("id, nombre").execute().data or []
        roles_por_id = {int(rol["id"]): rol["nombre"] for rol in roles if rol.get("id") is not None}

        consulta = cliente.table("usuario").select("id, email, nombre_completo, id_rol, created_at, last_seen")
        if email:
            consulta = consulta.ilike("email", f"%{email.strip()}%")

        respuesta = consulta.order("created_at", desc=True).limit(200).execute()
        filas = respuesta.data or []
        return [self._mapear_usuario_con_rol(fila, roles_por_id) for fila in filas]

    def crear_usuario(
        self,
        actor_id: str,
        roles_usuario: list[str],
        data: CrearUsuarioAdminRequest,
        ip: str | None,
    ) -> dict:
        self._validar_admin(roles_usuario)
        cliente = self._supabase_requerido()

        rol = self._obtener_rol(data.rol)

        existe = (
            cliente.table("usuario")
            .select("id")
            .eq("email", str(data.email))
            .limit(1)
            .execute()
        )
        if existe.data:
            raise HTTPException(status_code=409, detail="Ya existe un usuario con ese correo")

        try:
            creado = cliente.auth.admin.create_user(
                {
                    "email": str(data.email),
                    "password": data.password,
                    "email_confirm": True,
                    "user_metadata": {"full_name": data.nombre_completo, "provider": "email"},
                }
            )
        except Exception as exc:
            raise HTTPException(status_code=400, detail=f"No se pudo crear usuario: {exc}") from exc

        usuario = getattr(creado, "user", None)
        if usuario is None:
            raise HTTPException(status_code=400, detail="No se pudo crear usuario")

        actual = (
            cliente.table("usuario")
            .update(
                {
                    "nombre_completo": data.nombre_completo,
                    "email": str(data.email),
                    "proveedor": "email",
                    "id_rol": rol["id"],
                }
            )
            .eq("id", usuario.id)
            .execute()
        )

        registrar_bitacora(actor_id, "crear_usuario_admin", f"Se creo usuario {data.email}", ip)
        filas = actual.data or []
        fila = filas[0] if filas else {"id": usuario.id, "email": str(data.email), "nombre_completo": data.nombre_completo, "id_rol": rol["id"]}
        return {
            "id": fila.get("id"),
            "email": fila.get("email"),
            "nombre_completo": fila.get("nombre_completo") or data.nombre_completo,
            "rol": rol["nombre"],
            "created_at": fila.get("created_at"),
            "last_seen": fila.get("last_seen"),
        }

    def asignar_rol_por_email(
        self,
        actor_id: str,
        roles_usuario: list[str],
        data: AsignarRolPorEmailRequest,
        ip: str | None,
    ) -> dict:
        self._validar_admin(roles_usuario)
        cliente = self._supabase_requerido()
        rol = self._obtener_rol(data.rol)

        usuario_actual = (
            cliente.table("usuario")
            .select("id, email, nombre_completo, created_at, last_seen")
            .eq("email", str(data.email))
            .limit(1)
            .execute()
        )
        filas = usuario_actual.data or []
        if not filas:
            raise HTTPException(status_code=404, detail="No existe un usuario con ese correo")

        fila = filas[0]
        cliente.table("usuario").update({"id_rol": rol["id"]}).eq("id", fila["id"]).execute()

        registrar_bitacora(actor_id, "asignar_rol", f"{data.email} -> {data.rol}", ip)
        return {
            "id": fila.get("id"),
            "email": fila.get("email"),
            "nombre_completo": fila.get("nombre_completo") or "Usuario",
            "rol": rol["nombre"],
            "created_at": fila.get("created_at"),
            "last_seen": fila.get("last_seen"),
        }
