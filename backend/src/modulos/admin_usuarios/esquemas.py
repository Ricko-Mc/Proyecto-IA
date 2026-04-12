from pydantic import BaseModel, EmailStr

class RolResponse(BaseModel):
    id: int
    nombre: str
    descripcion: str | None = None

class UsuarioAdminResponse(BaseModel):
    id: str
    email: str
    nombre_completo: str
    rol: str
    created_at: str | None = None
    last_seen: str | None = None

class CrearUsuarioAdminRequest(BaseModel):
    nombre_completo: str
    email: EmailStr
    password: str
    rol: str

class AsignarRolPorEmailRequest(BaseModel):
    email: EmailStr
    rol: str
