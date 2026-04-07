from fastapi import APIRouter, Depends, Query, Request

from src.modulos.auth.servicio import obtener_usuario_actual
from src.modulos.reportes.esquemas import (
    ActualizarReporteRequest,
    ReporteRequest,
    ReporteResponse,
)
from src.modulos.reportes.servicio import ServicioReportes

router = APIRouter(prefix="/api/reportes", tags=["reportes"])
_estado_servicio_reportes = {"servicio": None}


def set_servicio_reportes(servicio: ServicioReportes) -> None:
    _estado_servicio_reportes["servicio"] = servicio


def get_servicio_reportes() -> ServicioReportes:
    servicio = _estado_servicio_reportes["servicio"]
    if servicio is None:
        raise RuntimeError("Servicio de reportes no disponible")
    return servicio


@router.post("", response_model=ReporteResponse)
async def crear_reporte_signo(
    datos: ReporteRequest,
    request: Request,
    usuario: dict = Depends(obtener_usuario_actual),
):
    ip = request.client.host if request.client else None
    return get_servicio_reportes().crear_reporte(usuario["usuario_id"], datos, ip)


@router.get("", response_model=list[ReporteResponse])
async def listar_reportes(
    estado: str | None = Query(default=None),
    usuario: dict = Depends(obtener_usuario_actual),
):
    return get_servicio_reportes().obtener_reportes(usuario["roles"], estado)


@router.patch("/{reporte_id}", response_model=ReporteResponse)
async def actualizar_reporte_signo(
    reporte_id: str,
    datos: ActualizarReporteRequest,
    request: Request,
    usuario: dict = Depends(obtener_usuario_actual),
):
    ip = request.client.host if request.client else None
    return get_servicio_reportes().actualizar_reporte(
        usuario["usuario_id"],
        usuario["roles"],
        reporte_id,
        datos,
        ip,
    )
