import re
import unicodedata
from anthropic import Anthropic

class LenguaIAAgent:
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.client = Anthropic(api_key=api_key)
        self.conversation_history = []

    def normalizar_palabra(self, palabra: str) -> str:
        palabra = palabra.lower().strip()
        palabra = unicodedata.normalize('NFD', palabra)
        palabra = ''.join(char for char in palabra if unicodedata.category(char) != 'Mn')
        palabra = re.sub(r'[^a-z0-9_\s]', '', palabra)
        palabra = re.sub(r'\s+', '_', palabra)
        return palabra

    def extraer_palabra_clave(self, mensaje_usuario: str) -> dict:
        system_prompt = """Eres un asistente especializado en la Lengua de Señas de Guatemala (LENSEGUA). 
Tu tarea es extraer la palabra clave o concepto principal que el usuario quiere aprender en lengua de señas.

Responde SOLO con la palabra clave en español, sin tildes, en minúsculas, separando palabras con guiones si es necesario.
Si el usuario pregunta por algo que no es una palabra en lengua de señas, responde con 'no_aplica'."""

        self.conversation_history.append({
            "role": "user",
            "content": mensaje_usuario
        })

        response = self.client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=100,
            system=system_prompt,
            messages=self.conversation_history
        )

        palabra_extraida = response.content[0].text.strip().lower()
        
        self.conversation_history.append({
            "role": "assistant",
            "content": palabra_extraida
        })

        return {
            'palabra_extraida': palabra_extraida,
            'palabra_normalizada': self.normalizar_palabra(palabra_extraida)
        }

    def generar_respuesta_contextual(self, mensaje_usuario: str, signo_info: dict = None) -> str:
        system_prompt = """Eres un asistente educativo especializado en la Lengua de Señas de Guatemala (LENSEGUA).
Ayudas a los usuarios a aprender y practicar LENSEGUA de forma amigable y accesible.
Usa un tono amable y educativo. Responde siempre en español guatemalteco."""

        if signo_info and signo_info.get('encontrado'):
            contexto = f"\nEl usuario preguntó por: '{signo_info.get('palabra', '')}'\nEste signo existe en la base de datos LENSEGUA en la categoría: {signo_info.get('categoria', 'desconocida')}"
        elif signo_info and not signo_info.get('encontrado'):
            contexto = f"\nEl usuario preguntó por: '{signo_info.get('palabra', '')}'\nEste signo aún no está en la base de datos de LENSEGUA."
        else:
            contexto = ""

        prompt_completo = f"{mensaje_usuario}{contexto}"

        response = self.client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=500,
            system=system_prompt,
            messages=[{"role": "user", "content": prompt_completo}]
        )

        return response.content[0].text.strip()

    def resetear_conversacion(self):
        self.conversation_history = []
