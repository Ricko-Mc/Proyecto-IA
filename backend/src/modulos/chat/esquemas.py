from typing import Literal

from pydantic import BaseModel

class MensajeChatRequest(BaseModel):
    mensaje: str
    conversacion_id: str | None = None
    clave_desambiguacion: str | None = None


class OpcionDesambiguacion(BaseModel):
    label: str
    clave: str

class RespuestaChatResponse(BaseModel):
    tipo_respuesta: Literal["video", "desambiguacion", "texto"] = "texto"
    mensaje_usuario: str
    conversacion_id: str
    palabra_clave: str
    signo_encontrado: bool
    signo_id: str | None = None
    url_video: str | None = None
    categoria: str | None = None
    respuesta_ia: str
    opciones: list[OpcionDesambiguacion] | None = None
