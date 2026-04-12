from pydantic import BaseModel

class RegisterRequest(BaseModel):
    nombre_completo: str
    email: str
    password: str
    confirmar_password: str

class LoginRequest(BaseModel):
    email: str
    password: str

class AuthResponse(BaseModel):
    usuario_id: str
    email: str
    nombre_completo: str
    avatar_url: str | None = None
    access_token: str
    proveedor: str
    roles: list[str]
