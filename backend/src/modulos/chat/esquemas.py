from typing import Literal

from pydantic import BaseModel

class MensajeChatRequest(BaseModel):
    mensaje: str
    conversacion_id: str | None = None
    clave_desambiguacion: str | None = None


class OpcionDesambiguacion(BaseModel):
    label: str
    clave: str


class VideoCompilacion(BaseModel):
    palabra: str
    signo_id: str
    url_video: str | None = None


class RespuestaChatResponse(BaseModel):
    tipo_respuesta: Literal["video", "compilacion", "desambiguacion", "no_encontrado", "error_backend"] = "no_encontrado"
    mensaje_usuario: str
    conversacion_id: str
    palabra_clave: str
    signo_encontrado: bool
    signo_id: str | None = None
    url_video: str | None = None
    categoria: str | None = None
    respuesta_ia: str
    opciones: list[OpcionDesambiguacion] | None = None
    videos_compilacion: list[VideoCompilacion] | None = None
