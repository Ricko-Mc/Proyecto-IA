from fastapi import APIRouter, HTTPException
from src.modules.chat.schemas import MensajeChatRequest, RespuestaChatResponse

router = APIRouter(prefix="/api", tags=["chat"])

chat_service = None

def set_chat_service(service):
    global chat_service
    chat_service = service

@router.post("/chat")
async def procesar_chat(datos: MensajeChatRequest) -> RespuestaChatResponse:
    if not chat_service:
        raise HTTPException(status_code=503, detail="Servicio de chat no disponible")
    
    if not datos.mensaje or not datos.mensaje.strip():
        raise HTTPException(status_code=400, detail="El mensaje no puede estar vacío")

    try:
        resultado = chat_service.procesar_mensaje(datos.mensaje)
        
        if 'error' in resultado:
            raise HTTPException(status_code=500, detail=resultado['error'])
        
        return RespuestaChatResponse(**resultado)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error procesando mensaje: {str(e)}")
