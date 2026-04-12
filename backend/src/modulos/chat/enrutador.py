from fastapi import APIRouter, Depends, HTTPException, Request
from src.modulos.chat.esquemas import MensajeChatRequest, RespuestaChatResponse
from src.modulos.auth import servicio as auth_servicio

router = APIRouter(prefix="/api", tags=["chat"])
_estado_servicio_chat = {"servicio": None}

def set_servicio_chat(servicio):
    """Inyecta el servicio de chat en el estado global del módulo."""
    _estado_servicio_chat["servicio"] = servicio

@router.post("/chat", response_model=RespuestaChatResponse)
async def procesar_chat(
    datos: MensajeChatRequest,
    request: Request,
    usuario: dict | None = Depends(auth_servicio.obtener_usuario_actual_opcional),
):
    """Procesa un mensaje de chat, extrae palabra clave y retorna contexto de signo."""
    servicio_chat = _estado_servicio_chat["servicio"]
    if servicio_chat is None:
        raise HTTPException(status_code=503, detail="Servicio de chat no disponible")
    if not datos.mensaje.strip():
        raise HTTPException(status_code=400, detail="El mensaje no puede estar vacio")
    usuario_id = usuario["usuario_id"] if usuario else None
    ip = request.client.host if request.client else None
    return servicio_chat.procesar_mensaje(
        datos.mensaje,
        datos.conversacion_id,
        usuario_id,
        ip,
    )
