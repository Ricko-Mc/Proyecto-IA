from typing import Optional
from src.utilidades.puente_prolog import PuenteProlog
from src.utilidades.agente_ia import AgenteIA
from src.utilidades.cliente_gcs import ClienteGCS


class ServicioChat:
    def __init__(self, puente_prolog: PuenteProlog, agente_ia: AgenteIA, cliente_gcs: Optional[ClienteGCS] = None):
        """Inicializa el servicio de chat con dependencias inyectadas."""
        self.puente_prolog = puente_prolog
        self.agente_ia = agente_ia
        self.cliente_gcs = cliente_gcs

    def procesar_mensaje(self, mensaje: str) -> dict:
        """Procesa un mensaje: extrae palabra clave, busca signo y genera respuesta contextual."""
        extraccion = self.agente_ia.extraer_palabra_clave(mensaje)
        palabra_clave = extraccion["palabra_normalizada"]
        signo_info = self.puente_prolog.buscar_signo(palabra_clave)
        categoria_info = self.puente_prolog.buscar_categoria(palabra_clave)
        url_video = None
        if signo_info["encontrado"] and self.cliente_gcs:
            url_video = self.cliente_gcs.obtener_url_video(signo_info["signo_id"])
        return {
            "mensaje_usuario": mensaje,
            "palabra_clave": palabra_clave,
            "signo_encontrado": signo_info["encontrado"],
            "signo_id": signo_info["signo_id"],
            "url_video": url_video,
            "categoria": categoria_info["categoria"] if categoria_info["encontrado"] else None,
            "respuesta_ia": self.agente_ia.generar_respuesta_contextual(mensaje, signo_info),
        }
