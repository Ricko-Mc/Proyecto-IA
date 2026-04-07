from pydantic import BaseModel


class EstadisticaSignoResponse(BaseModel):
    signo_id: str
    palabra: str | None = None
    categoria: str | None = None
    total_busquedas: int
    total_favoritos: int
    total_reportes: int


class EstadisticaUsuarioResponse(BaseModel):
    usuario_id: str
    total_conversaciones: int
    total_mensajes: int
    total_favoritos: int
