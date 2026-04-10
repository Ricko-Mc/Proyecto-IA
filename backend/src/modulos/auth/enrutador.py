from fastapi import APIRouter, Depends, Header, HTTPException, Request

from src.modulos.auth.esquemas import AuthResponse, LoginRequest, RegisterRequest
from src.modulos.auth.servicio import ServicioAuth, get_servicio_auth

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", response_model=AuthResponse)
async def registrar_usuario(datos: RegisterRequest, request: Request):
    ip = request.client.host if request.client else None
    return get_servicio_auth().registrar_usuario(datos, ip)


@router.post("/login", response_model=AuthResponse)
async def login_usuario(datos: LoginRequest, request: Request):
    ip = request.client.host if request.client else None
    return get_servicio_auth().login_usuario(datos, ip)


@router.get("/google")
async def login_google(request: Request, servicio: ServicioAuth = Depends(get_servicio_auth)):
    return servicio.login_google(request.headers.get("origin"))


@router.get("/me", response_model=AuthResponse)
async def perfil_actual(
    authorization: str | None = Header(default=None),
    servicio: ServicioAuth = Depends(get_servicio_auth),
):
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Hace falta token Bearer para esta accion")
    token = authorization.split(" ", 1)[1].strip()
    return servicio.obtener_perfil_desde_token(token)


@router.get("/callback", response_model=AuthResponse)
async def callback_google(request: Request, servicio: ServicioAuth = Depends(get_servicio_auth)):
    user_id = request.query_params.get("user_id")
    email = request.query_params.get("email")
    nombre = request.query_params.get("nombre")
    avatar_url = request.query_params.get("avatar_url")
    user_data = {
        "id": user_id,
        "email": email,
        "user_metadata": {"full_name": nombre, "avatar_url": avatar_url},
    }
    ip = request.client.host if request.client else None
    return servicio.sincronizar_usuario_google(user_data, ip)
