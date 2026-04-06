from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import logging

from app.config import settings
from app.prolog_bridge import PrologBridge
from app.ia_agent import LenguaIAAgent
from app.gcs_client import GCSClient

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    debug=settings.DEBUG
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

kb_path = settings.PROLOG_KB_PATH
if not os.path.exists(kb_path):
    kb_path = "prolog/knowledge_base.pl"

try:
    prolog_bridge = PrologBridge(kb_path)
    logger.info("Base de conocimiento Prolog cargada exitosamente")
except Exception as e:
    logger.error(f"Error al cargar Prolog: {e}")
    prolog_bridge = None

try:
    ia_agent = LenguaIAAgent(api_key=settings.ANTHROPIC_API_KEY)
    logger.info("Agente IA inicializado")
except Exception as e:
    logger.error(f"Error al inicializar IA: {e}")
    ia_agent = None

try:
    gcs_client = GCSClient(
        project_id=settings.GCP_PROJECT_ID,
        bucket_name=settings.GCS_BUCKET_NAME
    )
    logger.info("Cliente GCS inicializado")
except Exception as e:
    logger.error(f"Error al inicializar GCS (continuando con funcionalidad limitada): {e}")
    gcs_client = None


class MensajeChat(BaseModel):
    mensaje: str


class RespuestaChat(BaseModel):
    mensaje_usuario: str
    palabra_clave: str
    signo_encontrado: bool
    signo_id: str = None
    url_video: str = None
    categoria: str = None
    respuesta_ia: str
    error: str = None


class SignoInfo(BaseModel):
    palabra: str
    categoria: str
    signo_id: str
    url_video: str = None


@app.get("/api/health")
async def health_check():
    return {
        "status": "ok",
        "proyecto": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "prolog_disponible": prolog_bridge is not None,
        "ia_disponible": ia_agent is not None,
        "gcs_disponible": gcs_client is not None
    }


@app.post("/api/v1/chat")
async def chat(datos: MensajeChat):
    if not datos.mensaje or not datos.mensaje.strip():
        raise HTTPException(status_code=400, detail="El mensaje no puede estar vacío")

    if not prolog_bridge:
        raise HTTPException(status_code=503, detail="Base de conocimiento no disponible")
    
    if not ia_agent:
        raise HTTPException(status_code=503, detail="Agente IA no disponible")

    try:
        extraccion = ia_agent.extraer_palabra_clave(datos.mensaje)
        palabra_clave = extraccion['palabra_normalizada']

        signo_info = prolog_bridge.buscar_signo(palabra_clave)
        
        url_video = None
        categoria = None
        
        if signo_info['encontrado'] and gcs_client:
            url_video = gcs_client.obtener_url_video(signo_info['signo_id'])
            categoria_info = prolog_bridge.buscar_categoria(palabra_clave)
            if categoria_info['encontrado']:
                categoria = categoria_info['categoria']

        respuesta_ia = ia_agent.generar_respuesta_contextual(datos.mensaje, signo_info)

        return RespuestaChat(
            mensaje_usuario=datos.mensaje,
            palabra_clave=palabra_clave,
            signo_encontrado=signo_info['encontrado'],
            signo_id=signo_info['signo_id'],
            url_video=url_video,
            categoria=categoria,
            respuesta_ia=respuesta_ia
        )

    except Exception as e:
        logger.error(f"Error en /api/v1/chat: {e}")
        raise HTTPException(status_code=500, detail=f"Error procesando el mensaje: {str(e)}")


@app.get("/api/v1/signos")
async def obtener_todos_los_signos():
    if not prolog_bridge:
        raise HTTPException(status_code=503, detail="Base de conocimiento no disponible")

    try:
        lista_resultados = list(prolog_bridge.prolog.query("signo(Palabra, Categoria, SigID)"))
        
        signos = []
        for resultado in lista_resultados:
            signo_id = resultado['SigID']
            url_video = None
            if gcs_client:
                url_video = gcs_client.obtener_url_video(signo_id)

            signos.append(SignoInfo(
                palabra=resultado['Palabra'],
                categoria=resultado['Categoria'],
                signo_id=signo_id,
                url_video=url_video
            ))

        return {"total": len(signos), "signos": signos}

    except Exception as e:
        logger.error(f"Error en /api/v1/signos: {e}")
        raise HTTPException(status_code=500, detail=f"Error obteniendo signos: {str(e)}")


@app.get("/api/v1/categorias")
async def obtener_categorias():
    if not prolog_bridge:
        raise HTTPException(status_code=503, detail="Base de conocimiento no disponible")

    try:
        categorias = prolog_bridge.listar_categorias()
        return {"categorias": categorias}

    except Exception as e:
        logger.error(f"Error en /api/v1/categorias: {e}")
        raise HTTPException(status_code=500, detail=f"Error obteniendo categorías: {str(e)}")


@app.get("/api/v1/categorias/{categoria}")
async def obtener_signos_por_categoria(categoria: str):
    if not prolog_bridge:
        raise HTTPException(status_code=503, detail="Base de conocimiento no disponible")

    try:
        signos = prolog_bridge.obtener_signos_por_categoria(categoria)
        
        for signo in signos:
            if gcs_client:
                signo['url_video'] = gcs_client.obtener_url_video(signo['signo_id'])
        
        return {
            "categoria": categoria,
            "total": len(signos),
            "signos": signos
        }

    except Exception as e:
        logger.error(f"Error en /api/v1/categorias/{categoria}: {e}")
        raise HTTPException(status_code=500, detail=f"Error obteniendo signos de {categoria}: {str(e)}")


@app.get("/api/v1/signo/{palabra}")
async def buscar_signo(palabra: str):
    if not prolog_bridge:
        raise HTTPException(status_code=503, detail="Base de conocimiento no disponible")

    try:
        signo_info = prolog_bridge.buscar_signo(palabra)
        categoria_info = prolog_bridge.buscar_categoria(palabra)

        resultado = {
            "palabra": palabra,
            "encontrado": signo_info['encontrado'],
            "signo_id": signo_info['signo_id'],
            "categoria": categoria_info['categoria'] if categoria_info['encontrado'] else None,
            "url_video": None
        }

        if signo_info['encontrado'] and gcs_client:
            resultado['url_video'] = gcs_client.obtener_url_video(signo_info['signo_id'])

        return resultado

    except Exception as e:
        logger.error(f"Error en /api/v1/signo/{palabra}: {e}")
        raise HTTPException(status_code=500, detail=f"Error buscando signo: {str(e)}")


@app.on_event("startup")
async def startup_event():
    logger.info("LenguaIA backend iniciado")


@app.on_event("shutdown")
async def shutdown_event():
    logger.info("LenguaIA backend apagado")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
