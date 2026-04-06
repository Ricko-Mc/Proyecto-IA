from pydantic import BaseModel
from typing import Optional

class MensajeChatRequest(BaseModel):
    mensaje: str

class RespuestaChatResponse(BaseModel):
    mensaje_usuario: str
    palabra_clave: str
    signo_encontrado: bool
    signo_id: Optional[str] = None
    url_video: Optional[str] = None
    categoria: Optional[str] = None
    respuesta_ia: str
    error: Optional[str] = None
