from fastapi import HTTPException

from src.modulos.auth.servicio import validar_roles
from src.utilidades.supabase_client import obtener_cliente_supabase

class ServicioEstadisticas:
    def __init__(self):
        self.supabase = obtener_cliente_supabase()

    def _supabase_requerido(self):
        if self.supabase is None:
            raise HTTPException(status_code=503, detail="Supabase no esta configurado en el servidor")
        return self.supabase

    def obtener_estadisticas_signos(self, roles_usuario: list[str]) -> list[dict]:
        validar_roles(roles_usuario, ["admin"])
        cliente = self._supabase_requerido()
        try:
            respuesta = (
                cliente.table("estadistica_signo")
                .select(
                    "signo_id, palabra, categoria, total_busquedas, total_favoritos, total_reportes"
                )
                .order("total_busquedas", desc=True)
                .execute()
            )
            return respuesta.data or []
        except Exception as exc:
            raise HTTPException(
                status_code=400, detail=f"No se pudieron leer estadisticas de signos: {exc}"
            ) from exc

    def obtener_estadisticas_usuario(self, usuario_id: str) -> dict:
        cliente = self._supabase_requerido()
        try:
            respuesta = (
                cliente.table("estadistica_usuario")
                .select("usuario_id, total_conversaciones, total_mensajes, total_favoritos")
                .eq("usuario_id", usuario_id)
                .limit(1)
                .execute()
            )
            if not respuesta.data:
                return {
                    "usuario_id": usuario_id,
                    "total_conversaciones": 0,
                    "total_mensajes": 0,
                    "total_favoritos": 0,
                }
            return respuesta.data[0]
        except Exception as exc:
            raise HTTPException(
                status_code=400,
                detail=f"No se pudieron leer estadisticas del usuario: {exc}",
            ) from exc
