from typing import Optional
from src.utilidades.puente_prolog import PuenteProlog
from src.utilidades.cliente_gcs import ClienteGCS


class ServicioSignos:
    def __init__(self, puente_prolog: PuenteProlog, cliente_gcs: Optional[ClienteGCS] = None):
        """Inicializa el servicio de signos con acceso a Prolog y GCS."""
        self.puente_prolog = puente_prolog
        self.cliente_gcs = cliente_gcs

    def obtener_todos(self) -> list[dict]:
        """Obtiene todos los signos con sus URLs de video."""
        signos = self.puente_prolog.obtener_todos_los_signos()
        for signo in signos:
            signo["url_video"] = self.cliente_gcs.obtener_url_video(signo["signo_id"]) if self.cliente_gcs else None
        return signos

    def obtener_categorias(self) -> list[str]:
        """Obtiene lista de todas las categorías disponibles."""
        return self.puente_prolog.listar_categorias()

    def obtener_por_categoria(self, categoria: str) -> dict:
        """Obtiene todos los signos de una categoría con URLs de video."""
        signos = self.puente_prolog.obtener_signos_por_categoria(categoria)
        for signo in signos:
            signo["url_video"] = self.cliente_gcs.obtener_url_video(signo["signo_id"]) if self.cliente_gcs else None
        return {"categoria": categoria, "total": len(signos), "signos": signos}

    def buscar(self, palabra: str) -> dict:
        """Busca un signo por palabra y retorna información con URL de video."""
        signo = self.puente_prolog.buscar_signo(palabra)
        categoria = self.puente_prolog.buscar_categoria(palabra)
        return {
            "palabra": palabra,
            "encontrado": signo["encontrado"],
            "signo_id": signo["signo_id"],
            "categoria": categoria["categoria"] if categoria["encontrado"] else None,
            "url_video": self.cliente_gcs.obtener_url_video(signo["signo_id"]) if (signo["encontrado"] and self.cliente_gcs) else None,
        }
