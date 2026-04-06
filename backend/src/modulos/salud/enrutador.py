from fastapi import APIRouter

router = APIRouter(prefix="/api", tags=["salud"])


@router.get("/health")
async def health_check():
    """Verifica el estado del backend."""
    return {"status": "ok", "servicio": "backend-lenguaia"}
