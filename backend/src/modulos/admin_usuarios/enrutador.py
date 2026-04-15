from fastapi import APIRouter, Depends, Query, Request

from .esquemas import (
    AsignarRolPorEmailRequest,
    CrearUsuarioAdminRequest,
    RolResponse,
    UsuarioAdminResponse,
)
from .servicio import ServicioAdminUsuarios
from ..auth.servicio import obtener_usuario_actual

router = APIRouter(prefix="/api/admin/usuarios", tags=["admin-usuarios"])
_estado_servicio_admin_usuarios = {"servicio": None}

def set_servicio_admin_usuarios(servicio: ServicioAdminUsuarios) -> None:
    _estado_servicio_admin_usuarios["servicio"] = servicio

def get_servicio_admin_usuarios() -> ServicioAdminUsuarios:
    servicio = _estado_servicio_admin_usuarios["servicio"]
    if servicio is None:
        raise RuntimeError("Servicio de administracion de usuarios no disponible")
    return servicio

@router.get("/roles", response_model=list[RolResponse])
async def listar_roles(usuario: dict = Depends(obtener_usuario_actual)):
    return get_servicio_admin_usuarios().listar_roles(usuario["roles"])

@router.get("", response_model=list[UsuarioAdminResponse])
async def listar_usuarios(
    email: str | None = Query(default=None),
    usuario: dict = Depends(obtener_usuario_actual),
):
    return get_servicio_admin_usuarios().listar_usuarios(usuario["roles"], email)

@router.post("", response_model=UsuarioAdminResponse)
async def crear_usuario_admin(
    datos: CrearUsuarioAdminRequest,
    request: Request,
    usuario: dict = Depends(obtener_usuario_actual),
):
    ip = request.client.host if request.client else None
    return get_servicio_admin_usuarios().crear_usuario(
        usuario["usuario_id"],
        usuario["roles"],
        datos,
        ip,
    )

@router.patch("/rol", response_model=UsuarioAdminResponse)
async def asignar_rol(
    datos: AsignarRolPorEmailRequest,
    request: Request,
    usuario: dict = Depends(obtener_usuario_actual),
):
    ip = request.client.host if request.client else None
    return get_servicio_admin_usuarios().asignar_rol_por_email(
        usuario["usuario_id"],
        usuario["roles"],
        datos,
        ip,
    )
