from pydantic import BaseModel

class EstadisticaSignoResponse(BaseModel):
    signo_id: str
    palabra: str | None = None
    categoria: str | None = None
    total_busquedas: int
