import re
import unicodedata
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
            (r"(?:como|que|qué)\s+(?:se\s+)?(?:dice|hace|signa|significa)\s+(?:la|el)?\s*(.+)$", None),
            (r"(?:como|que|qué)\s+(?:es|son)\s+(?:la|el)?\s*(.+)$", None),
            (r"(?:se[ñn]a|signo)\s+(?:de|para)\s+(.+)$", None),
            (r"color\s+(.+)$", "colores"),
            (r"letra\s+(.+)$", "abecedario"),
            (r"(?:como|cómo)\s+decir\s+(?:la|el)?\s*(.+)$", None),          # "como decir morado"
            (r"(?:como|cómo)\s+(?:se\s+)?dice\s+el\s+color\s+(.+)$", "colores"),  # "como se dice el color x"
            (r"(?:como|cómo)\s+(?:se\s+)?dice\s+la\s+letra\s+(.+)$", "abecedario"), 
        ]

        for patron, categoria in patrones:
            coincidencia = re.match(patron, mensaje)
            if not coincidencia:
                continue
            palabra = coincidencia.group(1).strip()
            palabra = re.sub(r"\s+(por favor|pls|porfa)$", "", palabra).strip()
            palabra = re.sub(r"\s+(en\s+se[nñ]as|en\s+lensegua|por\s+favor|pls|porfa)$", "", palabra).strip()
            palabra = re.sub(r"^(la|el|los|las)\s+", "", palabra).strip()
            palabra = re.sub(r"^letra\s+", "", palabra).strip()
            palabra = re.sub(r"^color\s+", "", palabra).strip()
            palabra = re.sub(r"^se[ñn]a\s+(?:de\s+)?", "", palabra).strip() 
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
            palabra = respuesta.content[0].text.strip().lower()
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
            return respuesta.content[0].text.strip()
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
