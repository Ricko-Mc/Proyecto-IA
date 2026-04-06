from pydantic import BaseModel


class MensajeChatRequest(BaseModel):
    mensaje: str


class RespuestaChatResponse(BaseModel):
    mensaje_usuario: str
    palabra_clave: str
    signo_encontrado: bool
    signo_id: str | None = None
    url_video: str | None = None
    categoria: str | None = None
    respuesta_ia: str
