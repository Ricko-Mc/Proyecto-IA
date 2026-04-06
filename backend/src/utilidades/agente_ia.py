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
        if self.client is None:
            palabra = self._extraer_palabra_local(mensaje_usuario)
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
        if self.client is None:
            if signo_info.get("encontrado"):
                msg = (
                    "Encontre un signo relacionado. "
                    "Te muestro la opcion disponible para que la practiques."
                )
                return msg
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
            if signo_info.get("encontrado"):
                msg = (
                    "Encontre un signo relacionado. "
                    "Te muestro la opcion disponible para que la practiques."
                )
                return msg
            return (
                "No encontre ese signo por ahora. "
                "Proba con otra palabra o una variante mas simple."
            )

    def _extraer_palabra_local(self, mensaje_usuario: str) -> str:
        """Extrae palabra local dividiendo el texto por espacios cuando Claude no está disponible."""
        tokens = [token for token in self.normalizar(mensaje_usuario).split("_") if token]
        return tokens[0] if tokens else ""
