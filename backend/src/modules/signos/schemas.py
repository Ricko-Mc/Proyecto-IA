from pydantic import BaseModel
from typing import Optional, List

class SignoResponse(BaseModel):
    palabra: str
    categoria: str
    signo_id: str
    url_video: Optional[str] = None

class SignosListResponse(BaseModel):
    total: int
    signos: List[SignoResponse]

class BusquedaSignoResponse(BaseModel):
    palabra: str
    encontrado: bool
    signo_id: Optional[str] = None
    categoria: Optional[str] = None
    url_video: Optional[str] = None

class CategoriasResponse(BaseModel):
    categorias: List[str]

class SignosPorCategoriaResponse(BaseModel):
    categoria: str
    total: int
    signos: List[SignoResponse]
