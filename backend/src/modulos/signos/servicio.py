from src.utilidades.puente_prolog import PuenteProlog
from src.utilidades.youtube import construir_url_embed_youtube
from src.utilidades.cache_ttl import CacheTTL

class ServicioSignos:
    def __init__(self, puente_prolog: PuenteProlog):
        """Inicializa el servicio de signos con acceso a Prolog."""
        self.puente_prolog = puente_prolog
        self._cache_busqueda = CacheTTL[str, dict](ttl_seconds=600, max_items=1024)

    def obtener_todos(self) -> list[dict]:
        """Obtiene todos los signos con sus URLs de video."""
        signos = self.puente_prolog.obtener_todos_los_signos()
        for signo in signos:
            referencia = self.puente_prolog.obtener_youtube_referencia_por_signo(signo["signo_id"])
            signo["url_video"] = construir_url_embed_youtube(referencia)
        return signos

    def obtener_categorias(self) -> list[str]:
        """Obtiene lista de todas las categorías disponibles."""
        return self.puente_prolog.listar_categorias()

    def obtener_por_categoria(self, categoria: str) -> dict:
        """Obtiene todos los signos de una categoría con URLs de video."""
        signos = self.puente_prolog.obtener_signos_por_categoria(categoria)
        for signo in signos:
            referencia = self.puente_prolog.obtener_youtube_referencia_por_signo(signo["signo_id"])
            signo["url_video"] = construir_url_embed_youtube(referencia)
        return {"categoria": categoria, "total": len(signos), "signos": signos}

    def buscar(self, palabra: str) -> dict:
        """Busca un signo por palabra y retorna información con URL de video."""
        cache_key = self.puente_prolog.normalizar(palabra)
        cached = self._cache_busqueda.get(cache_key)
        if cached is not None:
            return cached

        signo = self.puente_prolog.buscar_signo(palabra)
        categoria = self.puente_prolog.buscar_categoria(palabra)
        url_video = None
        if signo["encontrado"] and signo["signo_id"]:
            referencia = self.puente_prolog.obtener_youtube_referencia_por_signo(signo["signo_id"])
            url_video = construir_url_embed_youtube(referencia)
        resultado = {
            "palabra": palabra,
            "encontrado": signo["encontrado"],
            "signo_id": signo["signo_id"],
            "categoria": categoria["categoria"] if categoria["encontrado"] else None,
            "url_video": url_video,
        }
        self._cache_busqueda.set(cache_key, resultado)
        return resultado
