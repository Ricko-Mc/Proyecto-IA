from pydantic import BaseModel

class FavoritoRequest(BaseModel):
    signo_id: str
    palabra: str | None = None
    categoria: str | None = None

class FavoritoResponse(BaseModel):
    id: str
    signo_id: str
    palabra: str | None = None
    categoria: str | None = None
    created_at: str
