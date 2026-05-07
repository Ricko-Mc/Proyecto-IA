from fastapi import APIRouter, HTTPException, Query

router = APIRouter(prefix="/api", tags=["signos"])
_estado_servicio_signos = {"servicio": None}

def set_servicio_signos(servicio):
    """Inyecta el servicio de signos en el estado global del módulo."""
    _estado_servicio_signos["servicio"] = servicio

@router.get("/signos")
async def obtener_signos():
    """Retorna todos los signos de la base de datos con URLs de videos."""
    servicio_signos = _estado_servicio_signos["servicio"]
    if servicio_signos is None:
        raise HTTPException(status_code=503, detail="Servicio no disponible")
    signos = servicio_signos.obtener_todos()
    return {"total": len(signos), "signos": signos}

@router.get("/categorias")
async def obtener_categorias():
    """Retorna lista de todas las categorías de signos disponibles."""
    servicio_signos = _estado_servicio_signos["servicio"]
    if servicio_signos is None:
        raise HTTPException(status_code=503, detail="Servicio no disponible")
    return {"categorias": servicio_signos.obtener_categorias()}

@router.get("/categorias/{categoria}")
async def obtener_signos_por_categoria(categoria: str):
    """Retorna todos los signos de una categoría específica."""
    servicio_signos = _estado_servicio_signos["servicio"]
    if servicio_signos is None:
        raise HTTPException(status_code=503, detail="Servicio no disponible")
    return servicio_signos.obtener_por_categoria(categoria)

@router.get("/signo/{palabra}")
async def buscar_signo(palabra: str):
    """Busca un signo por palabra clave."""
    servicio_signos = _estado_servicio_signos["servicio"]
    if servicio_signos is None:
        raise HTTPException(status_code=503, detail="Servicio no disponible")
    return servicio_signos.buscar(palabra)

@router.get("/memoria-pares")
def get_memoria_pares(categoria: str = Query(...)):
    """
    Retorna 10 pares (palabra + video) para el juego de memoria.
    Si es 'mixta', selecciona de todas las categorías disponibles.
    """
    servicio_signos = _estado_servicio_signos["servicio"]
    if servicio_signos is None:
        raise HTTPException(status_code=503, detail="Servicio no disponible")
    return servicio_signos.obtener_pares_juego(categoria)
