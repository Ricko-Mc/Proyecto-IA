from fastapi import APIRouter, HTTPException

router = APIRouter(prefix="/api", tags=["signos"])

signos_service = None

def set_signos_service(service):
    global signos_service
    signos_service = service

@router.get("/signos")
async def obtener_todos_los_signos():
    if not signos_service:
        raise HTTPException(status_code=503, detail="Servicio no disponible")
    
    try:
        signos = signos_service.obtener_todos_los_signos()
        return {
            "total": len(signos),
            "signos": signos
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error obteniendo signos: {str(e)}")

@router.get("/categorias")
async def obtener_categorias():
    if not signos_service:
        raise HTTPException(status_code=503, detail="Servicio no disponible")
    
    try:
        categorias = signos_service.obtener_categorias()
        return {"categorias": categorias}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error obteniendo categorías: {str(e)}")

@router.get("/categorias/{categoria}")
async def obtener_signos_por_categoria(categoria: str):
    if not signos_service:
        raise HTTPException(status_code=503, detail="Servicio no disponible")
    
    try:
        resultado = signos_service.obtener_signos_por_categoria(categoria)
        if not resultado:
            raise HTTPException(status_code=404, detail=f"Categoría '{categoria}' no encontrada")
        return resultado
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error obteniendo signos: {str(e)}")

@router.get("/signo/{palabra}")
async def buscar_signo(palabra: str):
    if not signos_service:
        raise HTTPException(status_code=503, detail="Servicio no disponible")
    
    try:
        resultado = signos_service.buscar_signo(palabra)
        return resultado
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error buscando signo: {str(e)}")
