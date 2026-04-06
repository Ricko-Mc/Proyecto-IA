from typing import Optional
from src.utils.prolog_bridge import PrologBridge
from src.utils.ia_agent import LenguaIAAgent
from src.utils.gcs_client import GCSClient

class ChatService:
    def __init__(self, prolog_bridge: PrologBridge, ia_agent: LenguaIAAgent, gcs_client: Optional[GCSClient] = None):
        self.prolog_bridge = prolog_bridge
        self.ia_agent = ia_agent
        self.gcs_client = gcs_client

    def procesar_mensaje(self, mensaje: str) -> dict:
        if not mensaje or not mensaje.strip():
            return {
                'error': 'El mensaje no puede estar vacío'
            }

        try:
            extraccion = self.ia_agent.extraer_palabra_clave(mensaje)
            palabra_clave = extraccion['palabra_normalizada']

            signo_info = self.prolog_bridge.buscar_signo(palabra_clave)
            
            url_video = None
            categoria = None
            
            if signo_info['encontrado']:
                categoria_info = self.prolog_bridge.buscar_categoria(palabra_clave)
                if categoria_info['encontrado']:
                    categoria = categoria_info['categoria']
                
                if self.gcs_client:
                    url_video = self.gcs_client.obtener_url_video(signo_info['signo_id'])

            respuesta_ia = self.ia_agent.generar_respuesta_contextual(mensaje, signo_info)

            return {
                'mensaje_usuario': mensaje,
                'palabra_clave': palabra_clave,
                'signo_encontrado': signo_info['encontrado'],
                'signo_id': signo_info['signo_id'],
                'url_video': url_video,
                'categoria': categoria,
                'respuesta_ia': respuesta_ia
            }

        except Exception as e:
            return {
                'error': f'Error procesando el mensaje: {str(e)}'
            }
