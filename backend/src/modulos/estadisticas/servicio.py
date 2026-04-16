from fastapi import HTTPException

class ServicioEstadisticas:
    def obtener_estadisticas_signos(self) -> list[dict]:
        try:
            return []
        except Exception as exc:
            raise HTTPException(
                status_code=400, detail=f"No se pudieron leer estadisticas de signos: {exc}"
            ) from exc
