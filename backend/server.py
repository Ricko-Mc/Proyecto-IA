import uvicorn
import logging
import os
from src.config.settings import settings
from src.utils.prolog_bridge import PrologBridge
from src.utils.ia_agent import LenguaIAAgent
from src.utils.gcs_client import GCSClient
from src.modules.chat import router as chat_router
from src.modules.signos import router as signos_router
from src.modules.chat.service import ChatService
from src.modules.signos.service import SignosService
from app import app

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def setup_services():
    prolog_path = os.path.join(os.path.dirname(__file__), 'src', 'prolog', 'rules.pl')
    
    try:
        prolog_bridge = PrologBridge(prolog_path)
        logger.info("Base de datos Prolog cargada exitosamente")
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
            bucket_name=settings.GCS_BUCKET_NAME,
            credentials_path=settings.GCS_CREDENTIALS_PATH
        )
        logger.info("Cliente GCS inicializado")
    except Exception as e:
        logger.warning(f"GCS no disponible (continuando con funcionalidad limitada): {e}")
        gcs_client = None

    if prolog_bridge and ia_agent:
        chat_service = ChatService(prolog_bridge, ia_agent, gcs_client)
        chat_router.set_chat_service(chat_service)

    if prolog_bridge:
        signos_service = SignosService(prolog_bridge, gcs_client)
        signos_router.set_signos_service(signos_service)

if __name__ == "__main__":
    setup_services()
    uvicorn.run(
        "app:app",
        host="0.0.0.0",
        port=settings.PORT,
        reload=settings.ENVIRONMENT == "development"
    )
