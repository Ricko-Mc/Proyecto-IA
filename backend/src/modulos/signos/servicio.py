from src.utilidades.puente_prolog import PuenteProlog
from src.utilidades.youtube import construir_url_embed_youtube
from src.utilidades.cache_ttl import CacheTTL
import os
import random

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
            referencia = self.puente_prolog.obtener_youtube_referencia_por_signo(signo["signo_id"])
            signo["url_video"] = construir_url_embed_youtube(referencia)
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
            referencia = self.puente_prolog.obtener_youtube_referencia_por_signo(signo["signo_id"])
            signo["url_video"] = construir_url_embed_youtube(referencia)

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

# 1. Configurar la ruta absoluta hacia tu archivo reglas.pl
ruta_actual = os.path.dirname(os.path.abspath(__file__))
ruta_reglas = os.path.normpath(os.path.join(ruta_actual, "../../prolog/reglas.pl"))

# 2. Instanciar el puente (Si ya tienes una instancia global en otro archivo, puedes importarla en su lugar)
puente = PuenteProlog(ruta_reglas)    

def obtener_pares_juego(categoria: str) -> list[dict]:
    """
    Obtiene 10 pares aleatorios de señas y sus IDs de YouTube desde Prolog.
    Optimizado para no devolver redundancias.
    """
    categorias_validas = ["abecedario", "alimentos", "animales", "colores", "frases_comunes", "saludos"]
    
    # 3. Obtener el listado de signos según la categoría
    if categoria == "mixta":
        todos_los_signos = puente.obtener_todos_los_signos()
        # Filtramos para asegurarnos de usar solo las categorías del juego
        signos_disponibles = [s for s in todos_los_signos if s.get("categoria") in categorias_validas]
    else:
        signos_disponibles = puente.obtener_signos_por_categoria(categoria)

    # 4. Seleccionar 10 elementos aleatorios sin repetición
    cantidad_a_seleccionar = min(10, len(signos_disponibles))
    seleccion = random.sample(signos_disponibles, cantidad_a_seleccionar)

    pares = []
    for signo in seleccion:
        palabra = signo["palabra"]
        
        # 5. Usamos tu método buscar_signo para extraer la referencia de YouTube
        info_signo = puente.buscar_signo(palabra)
        
        # Obtenemos la referencia de YouTube o usamos el ID de la seña como respaldo
        video_id = info_signo.get("youtube_referencia") or signo.get("signo_id") or "placeholder_id"
        
        # Formateamos la palabra para que se vea bien en el frontend (ej. "buenos_dias" -> "Buenos Dias")
        palabra_formateada = palabra.replace("_", " ").title()
        
        pares.append({
            "id": palabra.lower().replace(" ", "-"),
            "palabra": palabra_formateada,
            "video_id": video_id  # Solo el ID, el frontend se encarga del iframe optimizado
        })
    
    return pares
