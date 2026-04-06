import os
import re
import subprocess
import unicodedata


class PuenteProlog:
    def __init__(self, ruta_reglas: str):
        """Inicializa el puente Prolog con la ruta a las reglas."""
        self.ruta_reglas_abs = os.path.abspath(ruta_reglas)
        self.base_dir = os.path.dirname(os.path.dirname(os.path.dirname(self.ruta_reglas_abs)))

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

    def _ejecutar(self, goal: str) -> str:
        """Ejecuta una consulta Prolog en el proceso swipl y retorna la salida."""
        try:
            resultado = subprocess.run(
                ["swipl", "-q", "-s", self.ruta_reglas_abs, "-g", goal, "-t", "halt"],
                cwd=self.base_dir,
                capture_output=True,
                text=True,
                check=False,
            )
        except FileNotFoundError as exc:
            raise RuntimeError(
                "No se encontro el ejecutable 'swipl'. Instala SWI-Prolog y agrega swipl al PATH."
            ) from exc

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
            return {"encontrado": True, "palabra": palabra_normalizada, "signo_id": salida}
        return {"encontrado": False, "palabra": palabra_normalizada, "signo_id": None}

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
