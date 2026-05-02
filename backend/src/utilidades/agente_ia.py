import re
import unicodedata
from typing import Any
from anthropic import (
    APIConnectionError,
    APIError,
    APITimeoutError,
    Anthropic,
    AuthenticationError,
    RateLimitError,
)

class AgenteIA:
    def __init__(self, api_key: str):
        """Inicializa el agente IA con clave Anthropic (puede ser vacía para usar fallback)."""
        self.client = Anthropic(api_key=api_key) if api_key.strip() else None

    def _extraer_patron_contextual(self, mensaje_usuario: str) -> tuple[str | None, str | None]:
        """Detecta consultas guiadas como 'como se dice X' o 'color X'."""
        mensaje = mensaje_usuario.strip().lower()
        mensaje = unicodedata.normalize("NFD", mensaje)
        mensaje = "".join(caracter for caracter in mensaje if unicodedata.category(caracter) != "Mn")
        mensaje = re.sub(r"[^a-z0-9_\s]", "", mensaje)
        mensaje = re.sub(r"\s+", " ", mensaje).strip()

        patrones = [
            # ── Cómo se dice / hace / signa ──────────────────────────────────
            (r"(?:como|que|que)\s+(?:se\s+)?(?:dice|hace|signa|significa)\s+(?:la|el|los|las)?\s*(.+)$", None),
            (r"(?:como|como)\s+(?:es|son)\s+(?:la|el|los|las)?\s*(.+)$", None),
            (r"(?:como|como)\s+decir\s+(?:la|el|los|las)?\s*(.+)$", None),
            (r"(?:como|como)\s+se\s+expresa\s+(?:la|el)?\s*(.+)$", None),
            (r"(?:como|como)\s+se\s+escribe\s+(?:la|el)?\s*(.+)$", None),
            (r"(?:como|como)\s+se\s+representa\s+(?:la|el)?\s*(.+)$", None),

            # ── Seña / signo de X ─────────────────────────────────────────────
            (r"(?:sena|signo)\s+(?:de|para|del|de la|de los|de las)\s+(.+)$", None),
            (r"(?:cual|que)\s+(?:es\s+)?(?:la\s+)?(?:sena|signo)\s+(?:de|para|del)?\s*(.+)$", None),
            (r"(?:muestrame|mostrame|ensename|enseñame)\s+(?:la\s+)?(?:sena|signo)\s+(?:de|para)?\s*(.+)$", None),
            (r"(?:muestrame|mostrame|ensename)\s+(?:como\s+(?:se\s+)?(?:dice|hace|signa)\s+)?(.+)$", None),
            (r"(?:quiero\s+(?:ver|aprender|saber|conocer))\s+(?:la\s+)?(?:sena|signo)\s+(?:de|para)?\s*(.+)$", None),
            (r"quiero\s+aprender\s+(?:la\s+)?(?:palabra\s+)?(.+)$", None),
            (r"quiero\s+saber\s+(?:como\s+(?:se\s+)?(?:dice|hace|signa)\s+)?(?:la|el)?\s*(.+)$", None),
            (r"quiero\s+ver\s+(?:la\s+)?(?:sena\s+(?:de|para)\s+)?(.+)$", None),

            # ── Buscar / encontrar ────────────────────────────────────────────
            (r"busca(?:r|me)?\s+(?:la\s+)?(?:sena|signo|palabra)\s+(?:de|para)?\s*(.+)$", None),
            (r"encuentra(?:me)?\s+(?:la\s+)?(?:sena|signo)\s+(?:de|para)?\s*(.+)$", None),
            (r"dame\s+(?:la\s+)?(?:sena|signo|informacion)\s+(?:de|sobre|para)?\s*(.+)$", None),
            (r"dame\s+(?:el\s+)?(?:video\s+(?:de|sobre)\s+)?(.+)$", None),
            (r"necesito\s+(?:la\s+)?(?:sena|signo)\s+(?:de|para)?\s*(.+)$", None),
            (r"necesito\s+(?:aprender|saber|ver)\s+(?:la\s+)?(?:sena\s+(?:de|para)\s+)?(.+)$", None),

            # ── Preguntas directas ────────────────────────────────────────────
            (r"(?:que\s+significa|que\s+es)\s+(?:la\s+)?(?:sena|signo)\s+(?:de|para)?\s*(.+)$", None),
            (r"(?:sabes|conoces)\s+(?:la\s+)?(?:sena|signo)\s+(?:de|para)?\s*(.+)$", None),
            (r"(?:hay|existe|tienen)\s+(?:la\s+)?(?:sena|signo)\s+(?:para|de)?\s*(.+)$", None),
            (r"(?:puedes|podrias)\s+(?:mostrarme|ensenarme|decirme)\s+(?:como\s+(?:se\s+)?(?:dice|hace)\s+)?(?:la|el)?\s*(.+)$", None),
            (r"(?:dime|explicame|indicame)\s+(?:como\s+(?:se\s+)?(?:dice|hace|signa)\s+)?(?:la|el)?\s*(.+)$", None),

            # ── En lengua de señas / LSG / LENSEGUA ──────────────────────────
            (r"(.+)\s+en\s+(?:lengua\s+de\s+senas|lsguatemala|lensegua|senas|lenguaje\s+de\s+senas)$", None),
            (r"(.+)\s+en\s+senas$", None),
            (r"(?:como\s+(?:se\s+)?(?:dice|hace|signa)\s+)?(.+)\s+en\s+(?:senas|lsguatemala|lensegua)$", None),

            # ── Categorías específicas ────────────────────────────────────────
            (r"color\s+(.+)$", "colores"),
            (r"(?:como\s+(?:se\s+)?dice\s+)?(?:el\s+)?color\s+(.+)$", "colores"),
            (r"(?:como\s+(?:se\s+)?dice\s+la\s+)?(?:letra|caracter)\s+(.+)$", "abecedario"),
            (r"letra\s+(.+)$", "abecedario"),
            (r"(?:el\s+)?(?:saludo|saludos?)\s+(.+)$", "saludos"),
            (r"(?:el\s+)?(?:alimento|comida|fruta|verdura)\s+(.+)$", "alimentos"),
            (r"(?:el\s+|la\s+)?(?:animal|animales)\s+(.+)$", "animales"),

            # ── Patrones cortos / coloquiales ─────────────────────────────────
            (r"sena\s+(.+)$", None),
            (r"signa\s+(.+)$", None),
            (r"ensenme\s+(.+)$", None),
            (r"muestrame\s+(.+)$", None),
            (r"video\s+(?:de|sobre|para)\s+(.+)$", None),
            (r"(?:que\s+tal|cual)\s+(?:es\s+)?(?:la\s+sena\s+(?:de|para)\s+)?(.+)$", None),

            # ── Frases con "palabra" explícita ────────────────────────────────
            (r"(?:la\s+)?palabra\s+(.+)$", None),
            (r"(?:como\s+(?:se\s+)?(?:dice|hace|signa)\s+)?la\s+palabra\s+(.+)$", None),
            (r"(?:busca|encuentra|dame)\s+la\s+palabra\s+(.+)$", None),
        ]

        for patron, categoria in patrones:
            coincidencia = re.match(patron, mensaje)
            if not coincidencia:
                continue
            palabra = coincidencia.group(1).strip()
            # Limpiar coletillas y artículos residuales
            palabra = re.sub(r"\s+(por favor|pls|porfa|gracias)$", "", palabra).strip()
            palabra = re.sub(r"\s+(en\s+senas|en\s+lensegua|en\s+lsguatemala|por\s+favor|pls|porfa)$", "", palabra).strip()
            palabra = re.sub(r"^(la|el|los|las|un|una)\s+", "", palabra).strip()
            palabra = re.sub(r"^letra\s+", "", palabra).strip()
            palabra = re.sub(r"^color\s+", "", palabra).strip()
            palabra = re.sub(r"^se[n]\s+(?:de\s+)?", "", palabra).strip()
            palabra = re.sub(r"^signo\s+(?:de\s+)?", "", palabra).strip()
            palabra = re.sub(r"\?$", "", palabra).strip()
            if palabra:
                return palabra, categoria

        return None, None

    def normalizar(self, texto: str) -> str:
        """Normaliza texto a minúsculas sin tildes y reemplaza espacios con guiones bajos."""
        texto = texto.lower().strip()
        texto = unicodedata.normalize("NFD", texto)
        texto = "".join(caracter for caracter in texto if unicodedata.category(caracter) != "Mn")
        texto = re.sub(r"[^a-z0-9_\s]", "", texto)
        return re.sub(r"\s+", "_", texto)

    def extraer_palabra_clave(self, mensaje_usuario: str) -> dict:
        """Extrae palabra clave del mensaje usando Claude o fallback local."""
        palabra_patron, categoria_patron = self._extraer_patron_contextual(mensaje_usuario)
        if palabra_patron:
            resultado = {
                "palabra_extraida": palabra_patron,
                "palabra_normalizada": self.normalizar(palabra_patron),
            }
            if categoria_patron:
                resultado["categoria_sugerida"] = categoria_patron
            return resultado

        palabra_local = self._extraer_palabra_local(mensaje_usuario)
        if palabra_local and len(mensaje_usuario.strip().split()) <= 2:
            return {
                "palabra_extraida": palabra_local,
                "palabra_normalizada": self.normalizar(palabra_local),
            }

        if self.client is None:
            palabra = palabra_local
            return {
                "palabra_extraida": palabra,
                "palabra_normalizada": self.normalizar(palabra),
            }

        try:
            respuesta = self.client.messages.create(
                model="claude-sonnet-4-20250514",
                max_tokens=60,
                system="Extrae solo una palabra clave en espanol sin tildes.",
                messages=[{"role": "user", "content": mensaje_usuario}],
            )
            palabra = self._extraer_texto_respuesta(respuesta).lower()
        except (
            APIError,
            APIConnectionError,
            APITimeoutError,
            RateLimitError,
            AuthenticationError,
            IndexError,
            AttributeError,
        ):
            palabra = self._extraer_palabra_local(mensaje_usuario)
        return {"palabra_extraida": palabra, "palabra_normalizada": self.normalizar(palabra)}

    def _extraer_texto_respuesta(self, respuesta: Any) -> str:
        if respuesta is None:
            return ""
        contenido = getattr(respuesta, "content", None)
        if isinstance(contenido, list) and contenido:
            primer = contenido[0]
            if isinstance(primer, dict):
                return str(primer.get("text", primer.get("value", ""))).strip()
            if hasattr(primer, "text"):
                return str(getattr(primer, "text", "")).strip()
            if hasattr(primer, "value"):
                return str(getattr(primer, "value", "")).strip()
            return str(primer).strip()
        if isinstance(respuesta, dict):
            return str(respuesta.get("content", "")).strip()
        return str(respuesta).strip()

    def generar_respuesta_contextual(self, mensaje_usuario: str, signo_info: dict) -> str:
        """Genera respuesta contextual sobre el signo encontrado usando Claude o fallback."""
        if signo_info.get("encontrado"):
            return "Aqui tienes la seña disponible para practicar."

        if self.client is None:
            return (
                "No encontre ese signo por ahora. "
                "Proba con otra palabra o una variante mas simple."
            )

        contexto = "Signo encontrado" if signo_info.get("encontrado") else "Signo no encontrado"
        try:
            respuesta = self.client.messages.create(
                model="claude-sonnet-4-20250514",
                max_tokens=300,
                system="Responde en espanol guatemalteco de forma educativa.",
                messages=[{"role": "user", "content": f"{mensaje_usuario}\n{contexto}"}],
            )
            return self._extraer_texto_respuesta(respuesta)
        except (
            APIError,
            APIConnectionError,
            APITimeoutError,
            RateLimitError,
            AuthenticationError,
            IndexError,
            AttributeError,
        ):
            return (
                "No encontre ese signo por ahora. "
                "Proba con otra palabra o una variante mas simple."
            )

    def _extraer_palabra_local(self, mensaje_usuario: str) -> str:
        """Devuelve toda la frase normalizada, permitiendo frases completas como 'como estas'."""
        return self.normalizar(mensaje_usuario)