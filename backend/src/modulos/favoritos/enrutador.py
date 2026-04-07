from fastapi import APIRouter, Depends, Request

from src.modulos.auth.servicio import obtener_usuario_actual
from src.modulos.favoritos.esquemas import FavoritoRequest, FavoritoResponse
from src.modulos.favoritos.servicio import ServicioFavoritos

router = APIRouter(prefix="/api/favoritos", tags=["favoritos"])
_estado_servicio_favoritos = {"servicio": None}


def set_servicio_favoritos(servicio: ServicioFavoritos) -> None:
    _estado_servicio_favoritos["servicio"] = servicio


def get_servicio_favoritos() -> ServicioFavoritos:
    servicio = _estado_servicio_favoritos["servicio"]
    if servicio is None:
        raise RuntimeError("Servicio de favoritos no disponible")
    return servicio


@router.post("", response_model=FavoritoResponse)
async def crear_favorito(
    datos: FavoritoRequest,
    request: Request,
    usuario: dict = Depends(obtener_usuario_actual),
):
    ip = request.client.host if request.client else None
    return get_servicio_favoritos().agregar_favorito(usuario["usuario_id"], datos, ip)


@router.delete("/{signo_id}")
async def borrar_favorito(
    signo_id: str,
    request: Request,
    usuario: dict = Depends(obtener_usuario_actual),
):
    ip = request.client.host if request.client else None
    return get_servicio_favoritos().eliminar_favorito(usuario["usuario_id"], signo_id, ip)


@router.get("", response_model=list[FavoritoResponse])
async def listar_favoritos(usuario: dict = Depends(obtener_usuario_actual)):
    return get_servicio_favoritos().obtener_favoritos(usuario["usuario_id"])
