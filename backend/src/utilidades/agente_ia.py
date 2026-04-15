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

    def normalizar(self, texto: str) -> str:
        """Normaliza texto a minúsculas sin tildes y reemplaza espacios con guiones bajos."""
        texto = texto.lower().strip()
        texto = unicodedata.normalize("NFD", texto)
        texto = "".join(caracter for caracter in texto if unicodedata.category(caracter) != "Mn")
        texto = re.sub(r"[^a-z0-9_\s]", "", texto)
        return re.sub(r"\s+", "_", texto)

    def extraer_palabra_clave(self, mensaje_usuario: str) -> dict:
        """Extrae palabra clave del mensaje usando Claude o fallback local."""
        palabra_local = self._extraer_palabra_local(mensaje_usuario)
        if palabra_local and len(mensaje_usuario.strip().split()) <= 4:
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
