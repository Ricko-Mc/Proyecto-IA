from fastapi import HTTPException

from src.modulos.favoritos.esquemas import FavoritoRequest
from src.utilidades.supabase_client import (
    actualizar_estadisticas_usuario,
    agregar_favorito,
    eliminar_favorito,
    obtener_favoritos,
    registrar_bitacora,
)


class ServicioFavoritos:
    def agregar_favorito(self, usuario_id: str, data: FavoritoRequest, ip: str | None) -> dict:
        try:
            favorito = agregar_favorito(usuario_id, data.signo_id, data.palabra, data.categoria)
            actualizar_estadisticas_usuario(usuario_id)
            registrar_bitacora(usuario_id, "agregar_favorito", f"Se agrego favorito {data.signo_id}", ip)
            return favorito
        except Exception as exc:
            raise HTTPException(status_code=400, detail=f"No se pudo guardar el favorito: {exc}") from exc

    def eliminar_favorito(self, usuario_id: str, signo_id: str, ip: str | None) -> dict:
        try:
            eliminar_favorito(usuario_id, signo_id)
            actualizar_estadisticas_usuario(usuario_id)
            registrar_bitacora(usuario_id, "eliminar_favorito", f"Se elimino favorito {signo_id}", ip)
            return {"eliminado": True}
        except Exception as exc:
            raise HTTPException(status_code=400, detail=f"No se pudo eliminar el favorito: {exc}") from exc

    def obtener_favoritos(self, usuario_id: str) -> list[dict]:
        try:
            return obtener_favoritos(usuario_id)
        except Exception as exc:
            raise HTTPException(status_code=400, detail=f"No se pudieron leer favoritos: {exc}") from exc
