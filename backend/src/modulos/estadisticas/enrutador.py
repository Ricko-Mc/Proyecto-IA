from fastapi import APIRouter

from src.modulos.estadisticas.esquemas import EstadisticaSignoResponse
from src.modulos.estadisticas.servicio import ServicioEstadisticas

router = APIRouter(prefix="/api/estadisticas", tags=["estadisticas"])
_estado_servicio_estadisticas = {"servicio": None}

def set_servicio_estadisticas(servicio: ServicioEstadisticas) -> None:
    _estado_servicio_estadisticas["servicio"] = servicio

def get_servicio_estadisticas() -> ServicioEstadisticas:
    servicio = _estado_servicio_estadisticas["servicio"]
    if servicio is None:
        raise RuntimeError("Servicio de estadisticas no disponible")
    return servicio

@router.get("/signos", response_model=list[EstadisticaSignoResponse])
async def listar_estadisticas_signos():
    return get_servicio_estadisticas().obtener_estadisticas_signos()
