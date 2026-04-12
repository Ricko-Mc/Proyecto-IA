from typing import Any
from datetime import datetime, timezone

from fastapi import Header, HTTPException

from src.config.configuracion import configuracion
from src.modulos.auth.esquemas import LoginRequest, RegisterRequest
from src.utilidades.supabase_client import (
    obtener_cliente_supabase,
    obtener_roles_usuario,
    registrar_bitacora,
)

class ServicioAuth:
    def __init__(self):
        self.supabase = obtener_cliente_supabase()

    def _supabase_requerido(self):
        if self.supabase is None:
            raise HTTPException(status_code=503, detail="Supabase no esta configurado en el servidor")
        return self.supabase

    def _mapear_error_auth(self, error: Exception) -> HTTPException:
        mensaje = str(error).lower()
        if "rate limit" in mensaje:
            return HTTPException(
                status_code=429,
                detail="Demasiados intentos ahorita, espera un rato y volve a probar",
            )
        if "already" in mensaje and "registered" in mensaje:
            return HTTPException(status_code=409, detail="Ese correo ya esta registrado")
        if "invalid" in mensaje and "email" in mensaje:
            return HTTPException(status_code=400, detail="El correo no es valido")
        if "invalid login credentials" in mensaje:
            return HTTPException(status_code=401, detail="Credenciales invalidas, revisa tus datos")
        return HTTPException(status_code=400, detail=f"No se pudo completar la autenticacion: {error}")

    def _asignar_rol_usuario(self, usuario_id: str) -> None:
        cliente = self._supabase_requerido()
        rol = cliente.table("rol").select("id").eq("nombre", "usuario").limit(1).execute()
        if not rol.data:
            raise HTTPException(status_code=500, detail="No se encontro el rol usuario en la base")
        cliente.table("usuario").update({"id_rol": rol.data[0]["id"]}).eq("id", usuario_id).execute()

    def registrar_usuario(self, data: RegisterRequest, ip: str | None) -> dict[str, Any]:
        cliente = self._supabase_requerido()
        if data.password != data.confirmar_password:
            raise HTTPException(status_code=400, detail="Las contrasenas no coinciden")

        try:
            registro = cliente.auth.admin.create_user(
                {
                    "email": str(data.email),
                    "password": data.password,
                    "email_confirm": True,
                    "user_metadata": {"nombre_completo": data.nombre_completo},
                }
            )
        except Exception as error:
            raise self._mapear_error_auth(error) from error
        usuario = getattr(registro, "user", None)
        if usuario is None:
            raise HTTPException(status_code=400, detail="No se pudo registrar el usuario")

        try:
            cliente.table("usuario").upsert(
                {
                    "id": usuario.id,
                    "nombre_completo": data.nombre_completo,
                    "email": str(data.email),
                    "avatar_url": None,
                    "proveedor": "email",
                },
                on_conflict="id",
            ).execute()

            self._asignar_rol_usuario(usuario.id)
            registrar_bitacora(usuario.id, "registro", "Registro de usuario por email", ip)
            roles = obtener_roles_usuario(usuario.id)
        except Exception as error:
            raise HTTPException(status_code=400, detail=f"No se pudo guardar el perfil del usuario: {error}") from error

        access_token = ""
        try:
            login = cliente.auth.sign_in_with_password(
                {"email": str(data.email), "password": data.password}
            )
            sesion = getattr(login, "session", None)
            if sesion and getattr(sesion, "access_token", None):
                access_token = sesion.access_token
        except Exception:
            access_token = ""

        return {
            "usuario_id": usuario.id,
            "email": str(data.email),
            "nombre_completo": data.nombre_completo,
            "avatar_url": None,
            "access_token": access_token,
            "proveedor": "email",
            "roles": roles,
        }

    def login_usuario(self, data: LoginRequest, ip: str | None) -> dict[str, Any]:
        cliente = self._supabase_requerido()
        try:
            login = cliente.auth.sign_in_with_password(
                {"email": str(data.email), "password": data.password}
            )
        except Exception as error:
            raise self._mapear_error_auth(error) from error
        sesion = getattr(login, "session", None)
        usuario = getattr(login, "user", None)
        if sesion is None or usuario is None:
            raise HTTPException(status_code=401, detail="Credenciales invalidas, revisa tus datos")

        perfil = (
            cliente.table("usuario")
            .select("nombre_completo, avatar_url, proveedor")
            .eq("id", usuario.id)
            .limit(1)
            .execute()
        )
        if perfil.data:
            fila = perfil.data[0]
            nombre = fila.get("nombre_completo") or "Usuario"
            avatar_url = fila.get("avatar_url")
            proveedor = fila.get("proveedor") or "email"
        else:
            nombre = "Usuario"
            avatar_url = None
            proveedor = "email"

        cliente.table("usuario").update(
            {"last_seen": datetime.now(timezone.utc).isoformat()}
        ).eq("id", usuario.id).execute()
        registrar_bitacora(usuario.id, "login", "Inicio de sesion por email", ip)
        roles = obtener_roles_usuario(usuario.id)

        return {
            "usuario_id": usuario.id,
            "email": usuario.email,
            "nombre_completo": nombre,
            "avatar_url": avatar_url,
            "access_token": sesion.access_token,
            "proveedor": proveedor,
            "roles": roles,
        }

    def _resolver_frontend_url(self, frontend_origin: str | None) -> str:
        if frontend_origin and frontend_origin in configuracion.origenes_permitidos:
            return frontend_origin
        return configuracion.FRONTEND_URL

    def login_google(self, frontend_origin: str | None = None) -> dict[str, str]:
        cliente = self._supabase_requerido()
        frontend_url = self._resolver_frontend_url(frontend_origin)
        respuesta = cliente.auth.sign_in_with_oauth(
            {
                "provider": "google",
                "options": {
                    "redirect_to": f"{frontend_url}/auth/callback",
                },
            }
        )
        url = getattr(respuesta, "url", None)
        if not url and isinstance(respuesta, dict):
            url = respuesta.get("url")
        if not url:
            raise HTTPException(status_code=500, detail="No se pudo generar el enlace de Google")
        return {"url": url}

    def sincronizar_usuario_google(self, user_data: dict[str, Any], ip: str | None) -> dict[str, Any]:
        cliente = self._supabase_requerido()
        usuario_id = user_data.get("id")
        email = user_data.get("email")
        metadata = user_data.get("user_metadata") or {}
        if not usuario_id or not email:
            raise HTTPException(status_code=400, detail="Los datos de Google llegaron incompletos")

        nombre = metadata.get("full_name") or metadata.get("name") or "Usuario"
        avatar_url = metadata.get("avatar_url") or metadata.get("picture")

        cliente.table("usuario").upsert(
            {
                "id": usuario_id,
                "nombre_completo": nombre,
                "email": email,
                "avatar_url": avatar_url,
                "proveedor": "google",
                "last_seen": datetime.now(timezone.utc).isoformat(),
            },
            on_conflict="id",
        ).execute()

        self._asignar_rol_usuario(usuario_id)
        registrar_bitacora(usuario_id, "login_google", "Inicio o sincronizacion por Google", ip)
        roles = obtener_roles_usuario(usuario_id)

        return {
            "usuario_id": usuario_id,
            "email": email,
            "nombre_completo": nombre,
            "avatar_url": avatar_url,
            "access_token": "",
            "proveedor": "google",
            "roles": roles,
        }

    def obtener_usuario_desde_token(self, token: str) -> dict[str, Any]:
        cliente = self._supabase_requerido()
        data = cliente.auth.get_user(token)
        usuario = getattr(data, "user", None)
        if usuario is None:
            raise HTTPException(status_code=401, detail="Sesion invalida, volve a iniciar sesion")
        roles = obtener_roles_usuario(usuario.id)
        return {"usuario_id": usuario.id, "email": usuario.email, "roles": roles}

    def obtener_perfil_desde_token(self, token: str) -> dict[str, Any]:
        cliente = self._supabase_requerido()
        data = cliente.auth.get_user(token)
        usuario = getattr(data, "user", None)
        if usuario is None:
            raise HTTPException(status_code=401, detail="Sesion invalida, volve a iniciar sesion")

        email = usuario.email or ""
        metadata = getattr(usuario, "user_metadata", None) or {}
        nombre_default = metadata.get("full_name") or metadata.get("name") or email or "Usuario"
        avatar_default = metadata.get("avatar_url") or metadata.get("picture")
        app_metadata = getattr(usuario, "app_metadata", None) or {}
        proveedor_default = app_metadata.get("provider") or "google"

        perfil = (
            cliente.table("usuario")
            .select("nombre_completo, avatar_url, proveedor")
            .eq("id", usuario.id)
            .limit(1)
            .execute()
        )

        if perfil.data:
            fila = perfil.data[0]
            nombre = fila.get("nombre_completo") or nombre_default
            avatar_url = fila.get("avatar_url") or avatar_default
            proveedor = fila.get("proveedor") or proveedor_default
        else:
            nombre = nombre_default
            avatar_url = avatar_default
            proveedor = proveedor_default
            cliente.table("usuario").upsert(
                {
                    "id": usuario.id,
                    "nombre_completo": nombre,
                    "email": email,
                    "avatar_url": avatar_url,
                    "proveedor": proveedor,
                    "last_seen": datetime.now(timezone.utc).isoformat(),
                },
                on_conflict="id",
            ).execute()
            self._asignar_rol_usuario(usuario.id)

        roles = obtener_roles_usuario(usuario.id)
        return {
            "usuario_id": usuario.id,
            "email": email,
            "nombre_completo": nombre,
            "avatar_url": avatar_url,
            "access_token": token,
            "proveedor": proveedor,
            "roles": roles,
        }

_estado_servicio_auth = {"servicio": None}

def set_servicio_auth(servicio: ServicioAuth) -> None:
    _estado_servicio_auth["servicio"] = servicio

def get_servicio_auth() -> ServicioAuth:
    servicio = _estado_servicio_auth["servicio"]
    if servicio is None:
        raise HTTPException(status_code=503, detail="Servicio de autenticacion no disponible")
    return servicio

async def obtener_usuario_actual(authorization: str | None = Header(default=None)) -> dict[str, Any]:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Hace falta token Bearer para esta accion")
    token = authorization.split(" ", 1)[1].strip()
    return get_servicio_auth().obtener_usuario_desde_token(token)

async def obtener_usuario_actual_opcional(
    authorization: str | None = Header(default=None),
) -> dict[str, Any] | None:
    if not authorization or not authorization.lower().startswith("bearer "):
        return None
    token = authorization.split(" ", 1)[1].strip()
    try:
        return get_servicio_auth().obtener_usuario_desde_token(token)
    except HTTPException:
        return None

def validar_roles(roles_usuario: list[str], roles_permitidos: list[str]) -> None:
    if not set(roles_usuario).intersection(set(roles_permitidos)):
        raise HTTPException(status_code=403, detail="No tenes permiso para esta accion")
