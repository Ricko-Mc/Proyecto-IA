import os
import random
from src.utilidades.puente_prolog import PuenteProlog
from src.utilidades.youtube import construir_url_embed_youtube
from src.utilidades.cache_ttl import CacheTTL


class ServicioSignos:
    def __init__(self, puente_prolog: PuenteProlog):
        """Inicializa el servicio de signos con acceso a Prolog."""
        self.puente_prolog = puente_prolog
        self._cache_busqueda = CacheTTL[str, dict](ttl_seconds=600, max_items=1024)
        self._cache_por_categoria: dict[str, dict] = {}

    def obtener_todos(self) -> list[dict]:
        """Obtiene todos los signos con sus URLs de video."""
        signos = self.puente_prolog.obtener_todos_los_signos()
        for signo in signos:
            signo_id = signo.get("signo_id")
            if signo_id:
                referencia = self.puente_prolog.obtener_youtube_referencia_por_signo(signo_id)
                signo["url_video"] = construir_url_embed_youtube(referencia) if referencia else None
            else:
                signo["url_video"] = None
        return signos

    def obtener_categorias(self) -> list[str]:
        """Obtiene lista de todas las categorías disponibles."""
        return self.puente_prolog.listar_categorias()

    def obtener_por_categoria(self, categoria: str) -> dict:
        """Obtiene todos los signos de una categoría con URLs de video."""
        cache_key = self.puente_prolog.normalizar(categoria)
        cached = self._cache_por_categoria.get(cache_key)
        if cached is not None:
            return cached

        signos = self.puente_prolog.obtener_signos_por_categoria(categoria)
        for signo in signos:
            signo_id = signo.get("signo_id")
            if signo_id:
                referencia = self.puente_prolog.obtener_youtube_referencia_por_signo(signo_id)
                signo["url_video"] = construir_url_embed_youtube(referencia) if referencia else None
            else:
                signo["url_video"] = None

        resultado = {"categoria": categoria, "total": len(signos), "signos": signos}
        self._cache_por_categoria[cache_key] = resultado
        return resultado

    def buscar(self, palabra: str) -> dict:
        """Busca un signo por palabra y retorna información con URL de video."""
        cache_key = self.puente_prolog.normalizar(palabra)
        cached = self._cache_busqueda.get(cache_key)
        if cached is not None:
            return cached

        signo = self.puente_prolog.buscar_signo(palabra)
        categoria = self.puente_prolog.buscar_categoria(palabra)
        url_video = None
        if signo["encontrado"] and signo.get("signo_id"):
            referencia = self.puente_prolog.obtener_youtube_referencia_por_signo(signo["signo_id"])
            url_video = construir_url_embed_youtube(referencia) if referencia else None
        resultado = {
            "palabra": palabra,
            "encontrado": signo["encontrado"],
            "signo_id": signo.get("signo_id"),
            "categoria": categoria["categoria"] if categoria.get("encontrado") else None,
            "url_video": url_video,
        }
        self._cache_busqueda.set(cache_key, resultado)
        return resultado

    def obtener_pares_juego(self, categoria: str) -> list[dict]:
        """
        Obtiene 10 pares aleatorios de señas y sus URLs de videos desde Prolog.
        Optimizado para no devolver redundancias.
        """
        categorias_validas = ["abecedario", "alimentos", "animales", "colores", "frases_comunes", "saludos"]

        if categoria == "mixta":
            todos_los_signos = self.puente_prolog.obtener_todos_los_signos()
            signos_disponibles = [s for s in todos_los_signos if s.get("categoria") in categorias_validas]
        else:
            signos_disponibles = self.puente_prolog.obtener_signos_por_categoria(categoria)

        cantidad_a_seleccionar = min(10, len(signos_disponibles))
        if cantidad_a_seleccionar == 0:
            return []

        seleccion = random.sample(signos_disponibles, cantidad_a_seleccionar)

        pares = []
        for signo in seleccion:
            palabra = signo["palabra"]
            signo_id = signo.get("signo_id")

            info_signo = self.buscar(palabra)
            url_video = info_signo.get("url_video")
            palabra_formateada = palabra.replace("_", " ").title()

            pares.append({
                "signo_id": signo_id,
                "palabra": palabra_formateada,
                "url_video": url_video,
                "categoria": signo.get("categoria")
            })

        return pares


# ============================================================
# FUNCIÓN INDEPENDIENTE PARA COMPATIBILIDAD CON EL ENRUTADOR
# ============================================================
def obtener_pares_juego(categoria: str) -> list[dict]:
    """
    Función independiente para obtener pares de juego.
    Esta función es utilizada por el enrutador que aún no usa la inyección de dependencias.
    """
    ruta_actual = os.path.dirname(os.path.abspath(__file__))
    ruta_reglas = os.path.normpath(os.path.join(ruta_actual, "../../prolog/reglas.pl"))
    puente = PuenteProlog(ruta_reglas)

    categorias_validas = ["abecedario", "alimentos", "animales", "colores", "frases_comunes", "saludos"]

    if categoria == "mixta":
        todos_los_signos = puente.obtener_todos_los_signos()
        signos_disponibles = [s for s in todos_los_signos if s.get("categoria") in categorias_validas]
    else:
        signos_disponibles = puente.obtener_signos_por_categoria(categoria)

    cantidad_a_seleccionar = min(10, len(signos_disponibles))
    if cantidad_a_seleccionar == 0:
        return []

    seleccion = random.sample(signos_disponibles, cantidad_a_seleccionar)

    pares = []
    for signo in seleccion:
        palabra = signo.get("palabra", "")
        signo_id = signo.get("signo_id")

        info_signo = puente.buscar_signo(palabra)
        url_video = None
        if info_signo.get("encontrado") and info_signo.get("signo_id"):
            referencia = puente.obtener_youtube_referencia_por_signo(info_signo["signo_id"])
            if referencia:
                url_video = construir_url_embed_youtube(referencia)

        pares.append({
            "signo_id": signo_id,
            "palabra": palabra.replace("_", " ").title(),
            "url_video": url_video,
            "categoria": signo.get("categoria")
        })

    return pares