from fastapi import APIRouter, Depends, HTTPException

from src.modulos.auth.servicio import obtener_usuario_actual
from src.modulos.estadisticas.esquemas import (
    EstadisticaSignoResponse,
    EstadisticaUsuarioResponse,
)
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
async def listar_estadisticas_signos(usuario: dict = Depends(obtener_usuario_actual)):
    return get_servicio_estadisticas().obtener_estadisticas_signos(usuario["roles"])


@router.get("/usuario/{usuario_id}", response_model=EstadisticaUsuarioResponse)
async def ver_estadisticas_usuario(usuario_id: str, usuario: dict = Depends(obtener_usuario_actual)):
    if usuario["usuario_id"] != usuario_id and "admin" not in usuario["roles"]:
        raise HTTPException(status_code=403, detail="Solo podes ver tus estadisticas")
    return get_servicio_estadisticas().obtener_estadisticas_usuario(usuario_id)
