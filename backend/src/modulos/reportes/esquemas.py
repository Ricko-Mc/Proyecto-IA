from pydantic import BaseModel


class ReporteRequest(BaseModel):
    signo_id: str
    motivo: str
    descripcion: str | None = None


class ReporteResponse(BaseModel):
    id: str
    signo_id: str
    motivo: str
    estado: str
    created_at: str


class ActualizarReporteRequest(BaseModel):
    estado: str
