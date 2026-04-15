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

    def _inferir_categoria_por_contexto(self, mensaje: str) -> str | None:
        mensaje_norm = self.puente_prolog.normalizar(mensaje)
        palabras = set(mensaje_norm.split("_"))

        if {"color", "colores"}.intersection(palabras):
            return "colores"
        if {"alimento", "alimentos", "comida", "comidas"}.intersection(palabras):
            return "alimentos"
        if {"animal", "animales"}.intersection(palabras):
            return "animales"
        if {"saludo", "saludos"}.intersection(palabras):
            return "saludos"
        if {"abecedario", "letra", "letras"}.intersection(palabras):
            return "abecedario"
        if {"frase", "frases"}.intersection(palabras):
            return "frases_comunes"
        return None

    def _sufijo_clave_categoria(self, categoria: str) -> str:
        mapping = {
            "colores": "color",
            "alimentos": "bebida",
            "animales": "animal",
            "saludos": "saludo",
            "abecedario": "abecedario",
            "frases_comunes": "frase",
        }
        return mapping.get(categoria, categoria)

    def _categoria_desde_clave(self, clave: str) -> str | None:
        clave_norm = self.puente_prolog.normalizar(clave)
        mapping = {
            "color": "colores",
            "bebida": "alimentos",
            "alimento": "alimentos",
            "animal": "animales",
            "saludo": "saludos",
            "abecedario": "abecedario",
            "frase": "frases_comunes",
        }
        for sufijo, categoria in mapping.items():
            if clave_norm.endswith(f"_{sufijo}"):
                return categoria
        return None

    def _construir_opciones_desambiguacion(self, palabra_clave: str, coincidencias: list[dict]) -> list[dict]:
        opciones = []
        for item in coincidencias:
            categoria = item.get("categoria", "")
            sufijo = self._sufijo_clave_categoria(categoria)
            opciones.append(
                {
                    "label": f"{palabra_clave} ({sufijo})".capitalize(),
                    "clave": f"{palabra_clave}_{sufijo}",
                }
            )
        return opciones

    def procesar_mensaje(
        self,
        mensaje: str,
        conversacion_id: str | None = None,
        clave_desambiguacion: str | None = None,
        usuario_id: str | None = None,
        ip: str | None = None,
    ) -> dict:
        """Procesa un mensaje: extrae palabra clave, busca signo y genera respuesta contextual."""
        cache_key = f"{mensaje.strip().lower()}|{(clave_desambiguacion or '').strip().lower()}"
        cache_hit = self._cache_respuestas.get(cache_key)

        if cache_hit is not None:
            tipo_respuesta = cache_hit.get("tipo_respuesta", "video" if cache_hit.get("signo_encontrado") else "texto")
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
            opciones = cache_hit.get("opciones")
        else:
            extraccion = self.agente_ia.extraer_palabra_clave(mensaje)
            palabra_clave = self.puente_prolog.normalizar(extraccion["palabra_normalizada"])
            categoria_contexto = self._inferir_categoria_por_contexto(mensaje)
            opciones = None

            coincidencias = self.puente_prolog.buscar_signos_por_palabra(palabra_clave)
            categoria_por_clave = self._categoria_desde_clave(clave_desambiguacion or "")

            if categoria_por_clave:
                categoria_contexto = categoria_por_clave

            if len(coincidencias) > 1 and not categoria_contexto:
                tipo_respuesta = "desambiguacion"
                respuesta_ia = (
                    f"La palabra '{palabra_clave}' puede referirse a dos señas. "
                    "¿Cuál deseas?"
                )
                opciones = self._construir_opciones_desambiguacion(palabra_clave, coincidencias)
                signo_info = {"encontrado": False, "signo_id": None}
                categoria_info = {"encontrado": False, "categoria": None}
                url_video = None
                self._cache_respuestas.set(
                    cache_key,
                    {
                        "tipo_respuesta": tipo_respuesta,
                        "palabra_clave": palabra_clave,
                        "signo_encontrado": False,
                        "signo_id": None,
                        "url_video": None,
                        "categoria": None,
                        "respuesta_ia": respuesta_ia,
                        "opciones": opciones,
                    },
                )
                conversacion_resuelta = conversacion_id or ""
                return {
                    "tipo_respuesta": tipo_respuesta,
                    "mensaje_usuario": mensaje,
                    "conversacion_id": conversacion_resuelta,
                    "palabra_clave": palabra_clave,
                    "signo_encontrado": False,
                    "signo_id": None,
                    "url_video": None,
                    "categoria": None,
                    "respuesta_ia": respuesta_ia,
                    "opciones": opciones,
                }

            if categoria_contexto:
                signo_info = self.puente_prolog.buscar_signo_en_categoria(
                    palabra_clave,
                    categoria_contexto,
                )
            else:
                signo_info = self.puente_prolog.buscar_signo(palabra_clave)

            if not signo_info["encontrado"] and categoria_contexto:
                signo_info = self.puente_prolog.buscar_signo(palabra_clave)

            if not signo_info["encontrado"]:
                signo_aproximado = self.puente_prolog.buscar_signo_aproximado(palabra_clave)
                if signo_aproximado["encontrado"]:
                    signo_info = signo_aproximado
                    palabra_clave = signo_aproximado.get("palabra_corregida", palabra_clave)

            if categoria_contexto and signo_info["encontrado"]:
                categoria_info = {"encontrado": True, "categoria": categoria_contexto}
            else:
                categoria_info = self.puente_prolog.buscar_categoria(palabra_clave)

            url_video = None
            if signo_info["encontrado"]:
                url_video = construir_url_embed_youtube(signo_info.get("youtube_referencia"))
            respuesta_ia = self.agente_ia.generar_respuesta_contextual(mensaje, signo_info)
            tipo_respuesta = "video" if signo_info["encontrado"] else "texto"
            self._cache_respuestas.set(
                cache_key,
                {
                    "tipo_respuesta": tipo_respuesta,
                    "palabra_clave": palabra_clave,
                    "signo_encontrado": signo_info["encontrado"],
                    "signo_id": signo_info["signo_id"],
                    "url_video": url_video,
                    "categoria": categoria_info["categoria"] if categoria_info["encontrado"] else None,
                    "respuesta_ia": respuesta_ia,
                    "opciones": opciones,
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
            "tipo_respuesta": tipo_respuesta,
            "mensaje_usuario": mensaje,
            "conversacion_id": conversacion_resuelta,
            "palabra_clave": palabra_clave,
            "signo_encontrado": signo_info["encontrado"],
            "signo_id": signo_info["signo_id"],
            "url_video": url_video,
            "categoria": categoria_info["categoria"] if categoria_info["encontrado"] else None,
            "respuesta_ia": respuesta_ia,
            "opciones": opciones,
        }
