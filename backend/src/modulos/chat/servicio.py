from src.utilidades.puente_prolog import PuenteProlog
from src.utilidades.agente_ia import AgenteIA
from src.utilidades.youtube import construir_url_embed_youtube
from src.utilidades.cache_ttl import CacheTTL
from src.utilidades.supabase_client import (
    actualizar_estadisticas_signo,
    actualizar_estadisticas_usuario,
    crear_conversacion,
    guardar_mensaje,
    obtener_cliente_supabase,
    registrar_bitacora,
)

class ServicioChat:
    def __init__(self, puente_prolog: PuenteProlog, agente_ia: AgenteIA):
        """Inicializa el servicio de chat con dependencias inyectadas."""
        self.puente_prolog = puente_prolog
        self.agente_ia = agente_ia
        self.supabase = obtener_cliente_supabase()
        self._cache_respuestas = CacheTTL[str, dict](ttl_seconds=300, max_items=512)

    def procesar_mensaje(
        self,
        mensaje: str,
        conversacion_id: str | None = None,
        usuario_id: str | None = None,
        ip: str | None = None,
    ) -> dict:
        """Procesa un mensaje: extrae palabra clave, busca signo y genera respuesta contextual."""
        cache_key = mensaje.strip().lower()
        cache_hit = self._cache_respuestas.get(cache_key)

        if cache_hit is not None:
            palabra_clave = cache_hit["palabra_clave"]
            signo_info = {
                "encontrado": cache_hit["signo_encontrado"],
                "signo_id": cache_hit["signo_id"],
            }
            categoria_info = {
                "encontrado": cache_hit["categoria"] is not None,
                "categoria": cache_hit["categoria"],
            }
            url_video = cache_hit["url_video"]
            respuesta_ia = cache_hit["respuesta_ia"]
        else:
            extraccion = self.agente_ia.extraer_palabra_clave(mensaje)
            palabra_clave = extraccion["palabra_normalizada"]
            signo_info = self.puente_prolog.buscar_signo(palabra_clave)
            if not signo_info["encontrado"]:
                signo_aproximado = self.puente_prolog.buscar_signo_aproximado(palabra_clave)
                if signo_aproximado["encontrado"]:
                    signo_info = signo_aproximado
                    palabra_clave = signo_aproximado.get("palabra_corregida", palabra_clave)
            categoria_info = self.puente_prolog.buscar_categoria(palabra_clave)
            url_video = None
            if signo_info["encontrado"]:
                url_video = construir_url_embed_youtube(signo_info.get("youtube_referencia"))
            respuesta_ia = self.agente_ia.generar_respuesta_contextual(mensaje, signo_info)
            self._cache_respuestas.set(
                cache_key,
                {
                    "palabra_clave": palabra_clave,
                    "signo_encontrado": signo_info["encontrado"],
                    "signo_id": signo_info["signo_id"],
                    "url_video": url_video,
                    "categoria": categoria_info["categoria"] if categoria_info["encontrado"] else None,
                    "respuesta_ia": respuesta_ia,
                },
            )

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
