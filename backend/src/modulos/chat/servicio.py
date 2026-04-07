from typing import Optional
from src.utilidades.puente_prolog import PuenteProlog
from src.utilidades.agente_ia import AgenteIA
from src.utilidades.cliente_gcs import ClienteGCS
from src.utilidades.supabase_client import (
    actualizar_estadisticas_signo,
    actualizar_estadisticas_usuario,
    crear_conversacion,
    guardar_mensaje,
    obtener_cliente_supabase,
    registrar_bitacora,
)


class ServicioChat:
    def __init__(self, puente_prolog: PuenteProlog, agente_ia: AgenteIA, cliente_gcs: Optional[ClienteGCS] = None):
        """Inicializa el servicio de chat con dependencias inyectadas."""
        self.puente_prolog = puente_prolog
        self.agente_ia = agente_ia
        self.cliente_gcs = cliente_gcs
        self.supabase = obtener_cliente_supabase()

    def procesar_mensaje(
        self,
        mensaje: str,
        conversacion_id: str | None = None,
        usuario_id: str | None = None,
        ip: str | None = None,
    ) -> dict:
        """Procesa un mensaje: extrae palabra clave, busca signo y genera respuesta contextual."""
        extraccion = self.agente_ia.extraer_palabra_clave(mensaje)
        palabra_clave = extraccion["palabra_normalizada"]
        signo_info = self.puente_prolog.buscar_signo(palabra_clave)
        categoria_info = self.puente_prolog.buscar_categoria(palabra_clave)
        url_video = None
        if signo_info["encontrado"] and self.cliente_gcs:
            url_video = self.cliente_gcs.obtener_url_video(signo_info["signo_id"])
        respuesta_ia = self.agente_ia.generar_respuesta_contextual(mensaje, signo_info)

        conversacion_resuelta = conversacion_id or ""
        if self.supabase and usuario_id:
            if not conversacion_resuelta:
                conversacion = crear_conversacion(usuario_id, mensaje[:60])
                conversacion_resuelta = conversacion.get("id") or ""
            if conversacion_resuelta:
                guardar_mensaje(
                    conversacion_resuelta,
                    "usuario",
                    mensaje,
                    palabra_clave,
                    signo_info["signo_id"],
                    url_video,
                )
                guardar_mensaje(
                    conversacion_resuelta,
                    "asistente",
                    respuesta_ia,
                    palabra_clave,
                    signo_info["signo_id"],
                    url_video,
                )
            if signo_info["encontrado"] and signo_info["signo_id"]:
                actualizar_estadisticas_signo(
                    signo_info["signo_id"],
                    palabra_clave,
                    categoria_info["categoria"] if categoria_info["encontrado"] else None,
                )
            actualizar_estadisticas_usuario(usuario_id)
            registrar_bitacora(usuario_id, "chat", f"Consulta por {palabra_clave}", ip)

        return {
            "mensaje_usuario": mensaje,
            "conversacion_id": conversacion_resuelta,
            "palabra_clave": palabra_clave,
            "signo_encontrado": signo_info["encontrado"],
            "signo_id": signo_info["signo_id"],
            "url_video": url_video,
            "categoria": categoria_info["categoria"] if categoria_info["encontrado"] else None,
            "respuesta_ia": respuesta_ia,
        }
