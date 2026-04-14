import os
import re
import subprocess
import unicodedata
from difflib import get_close_matches

class PuenteProlog:
    def __init__(self, ruta_reglas: str):
        """Inicializa el puente Prolog con la ruta a las reglas."""
        self.ruta_reglas_abs = os.path.abspath(ruta_reglas)
        self.base_dir = os.path.dirname(os.path.dirname(os.path.dirname(self.ruta_reglas_abs)))
        self._indice_palabras: list[str] | None = None

    def normalizar(self, texto: str) -> str:
        """Normaliza texto a minúsculas sin tildes y reemplaza espacios con guiones bajos."""
        texto = texto.lower().strip()
        texto = unicodedata.normalize("NFD", texto)
        texto = "".join(caracter for caracter in texto if unicodedata.category(caracter) != "Mn")
        texto = re.sub(r"[^a-z0-9_\s]", "", texto)
        return re.sub(r"\s+", "_", texto)

    def _atomizar(self, texto: str) -> str:
        """Convierte texto normalizado a un átomo Prolog entre comillas simples."""
        return f"'{self.normalizar(texto)}'"

    def _atomizar_literal(self, texto: str) -> str:
        """Convierte texto literal a átomo Prolog preservando mayúsculas y símbolos."""
        texto_escapado = texto.replace("'", "''")
        return f"'{texto_escapado}'"

    def _ejecutar(self, goal: str) -> str:
        """Ejecuta una consulta Prolog en el proceso swipl y retorna la salida."""
        swipl_paths = [
            r"C:\Program Files\swipl\bin\swipl.exe",
            "swipl",
        ]
        
        for swipl_path in swipl_paths:
            try:
                resultado = subprocess.run(
                    [swipl_path, "-q", "-s", self.ruta_reglas_abs, "-g", goal, "-t", "halt"],
                    cwd=self.base_dir,
                    capture_output=True,
                    text=True,
                    check=False,
                )
                break
            except FileNotFoundError:
                continue
        else:
            raise RuntimeError(
                "No se encontro el ejecutable 'swipl'. Instala SWI-Prolog en C:\\Program Files\\swipl\\ o agrega swipl al PATH."
            )

        if resultado.returncode != 0:
            error = resultado.stderr.strip() or resultado.stdout.strip()
            raise RuntimeError(error or "Error ejecutando consulta Prolog")
        return resultado.stdout.strip()

    def buscar_signo(self, palabra: str) -> dict:
        """Busca un signo en la base de datos Prolog por palabra."""
        palabra_normalizada = self.normalizar(palabra)
        atom = self._atomizar(palabra_normalizada)
        goal = f"(buscar_signo({atom}, SigID) -> format('~w', [SigID]) ; true)"
        salida = self._ejecutar(goal)
        if salida:
            return {
                "encontrado": True,
                "palabra": palabra_normalizada,
                "signo_id": salida,
                "youtube_referencia": self.obtener_youtube_referencia_por_signo(salida),
            }
        return {"encontrado": False, "palabra": palabra_normalizada, "signo_id": None}

    def buscar_signo_en_categoria(self, palabra: str, categoria: str) -> dict:
        """Busca un signo por palabra dentro de una categoria especifica."""
        palabra_normalizada = self.normalizar(palabra)
        categoria_normalizada = self.normalizar(categoria)
        palabra_atom = self._atomizar(palabra_normalizada)
        categoria_atom = self._atomizar(categoria_normalizada)
        goal = (
            f"(buscar_signo_en_categoria({palabra_atom}, {categoria_atom}, SigID) "
            f"-> format('~w', [SigID]) ; true)"
        )
        salida = self._ejecutar(goal)
        if salida:
            return {
                "encontrado": True,
                "palabra": palabra_normalizada,
                "signo_id": salida,
                "youtube_referencia": self.obtener_youtube_referencia_por_signo(salida),
            }
        return {"encontrado": False, "palabra": palabra_normalizada, "signo_id": None}

    def buscar_signos_por_palabra(self, palabra: str) -> list[dict]:
        """Obtiene todas las coincidencias de una palabra en distintas categorias."""
        palabra_normalizada = self.normalizar(palabra)
        atom = self._atomizar(palabra_normalizada)
        goal = (
            f"forall(signo({atom}, Categoria, SigID), "
            f"format('~w|~w~n', [Categoria, SigID]))"
        )
        salida = self._ejecutar(goal)
        coincidencias = []
        for linea in salida.splitlines():
            if not linea.strip():
                continue
            categoria, signo_id = linea.split("|", 1)
            coincidencias.append(
                {
                    "palabra": palabra_normalizada,
                    "categoria": categoria,
                    "signo_id": signo_id,
                    "youtube_referencia": self.obtener_youtube_referencia_por_signo(signo_id),
                }
            )
        return coincidencias

    def _obtener_indice_palabras(self) -> list[str]:
        """Construye y cachea el listado de palabras disponibles para matching aproximado."""
        if self._indice_palabras is None:
            signos = self.obtener_todos_los_signos()
            self._indice_palabras = sorted(
                {
                    self.normalizar(signo.get("palabra", ""))
                    for signo in signos
                    if signo.get("palabra")
                }
            )
        return self._indice_palabras

    def buscar_signo_aproximado(self, palabra: str, cutoff: float = 0.75) -> dict:
        """Busca un signo por similitud cuando no hay coincidencia exacta."""
        palabra_normalizada = self.normalizar(palabra)
        if not palabra_normalizada:
            return {"encontrado": False, "palabra": palabra_normalizada, "signo_id": None}

        candidata = get_close_matches(
            palabra_normalizada,
            self._obtener_indice_palabras(),
            n=1,
            cutoff=cutoff,
        )
        if not candidata:
            return {"encontrado": False, "palabra": palabra_normalizada, "signo_id": None}

        palabra_corregida = candidata[0]
        resultado = self.buscar_signo(palabra_corregida)
        if not resultado.get("encontrado"):
            return {"encontrado": False, "palabra": palabra_normalizada, "signo_id": None}

        return {
            **resultado,
            "aproximado": True,
            "palabra_original": palabra_normalizada,
            "palabra_corregida": palabra_corregida,
        }

    def buscar_categoria(self, palabra: str) -> dict:
        """Busca la categoría de una palabra en la base de datos Prolog."""
        palabra_normalizada = self.normalizar(palabra)
        atom = self._atomizar(palabra_normalizada)
        goal = f"(buscar_categoria({atom}, Categoria) -> format('~w', [Categoria]) ; true)"
        salida = self._ejecutar(goal)
        if salida:
            return {"encontrado": True, "palabra": palabra_normalizada, "categoria": salida}
        return {"encontrado": False, "palabra": palabra_normalizada, "categoria": None}

    def listar_categorias(self) -> list[str]:
        """Lista todas las categorías únicas disponibles en la base de datos Prolog."""
        query = (
            "forall((setof(Categoria, "
            "Palabra^SigID^signo(Palabra, Categoria, SigID), Categorias), "
            "member(Categoria, Categorias)), format('~w~n', [Categoria]))"
        )
        salida = self._ejecutar(query)
        return [linea.strip() for linea in salida.splitlines() if linea.strip()]

    def obtener_signos_por_categoria(self, categoria: str) -> list[dict]:
        """Obtiene signos que pertenecen a una categoría específica."""
        categoria_normalizada = self.normalizar(categoria)
        atom = self._atomizar(categoria_normalizada)
        goal = (
            f"forall(signo(Palabra, {atom}, SigID), "
            f"format('~w|~w~n', [Palabra, SigID]))"
        )
        salida = self._ejecutar(goal)
        signos = []
        for linea in salida.splitlines():
            if not linea.strip():
                continue
            palabra, signo_id = linea.split("|", 1)
            signos.append({"palabra": palabra, "categoria": categoria_normalizada, "signo_id": signo_id})
        return signos

    def obtener_todos_los_signos(self) -> list[dict]:
        """Obtiene todos los signos de todas las categorías desde Prolog."""
        query = (
            "forall(signo(Palabra, Categoria, SigID), "
            "format('~w|~w|~w~n', [Palabra, Categoria, SigID]))"
        )
        salida = self._ejecutar(query)
        signos = []
        for linea in salida.splitlines():
            if not linea.strip():
                continue
            palabra, categoria, signo_id = linea.split("|", 2)
            signos.append({"palabra": palabra, "categoria": categoria, "signo_id": signo_id})
        return signos

    def obtener_youtube_referencia_por_signo(self, signo_id: str) -> str | None:
        """Obtiene referencia de YouTube (ID o URL) asociada a un signo."""
        signo_atom = self._atomizar_literal(signo_id)
        goal = (
            f"(buscar_youtube_video_por_signo({signo_atom}, YoutubeRef) "
            f"-> format('~w', [YoutubeRef]) ; true)"
        )
        salida = self._ejecutar(goal)
        return salida or None
