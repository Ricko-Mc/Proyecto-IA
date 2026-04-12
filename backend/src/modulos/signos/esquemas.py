from pydantic import BaseModel

class SignoInfo(BaseModel):
    palabra: str
    categoria: str
    signo_id: str
    url_video: str | None = None
