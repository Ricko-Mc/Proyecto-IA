import os
import uvicorn
from src.config.configuracion import configuracion
from src.utilidades.puente_prolog import PuenteProlog
from src.utilidades.agente_ia import AgenteIA
from src.utilidades.cliente_gcs import ClienteGCS
from src.modulos.chat.enrutador import set_servicio_chat
from src.modulos.chat.servicio import ServicioChat
from src.modulos.signos.enrutador import set_servicio_signos
from src.modulos.signos.servicio import ServicioSignos
from src.modulos.auth.servicio import ServicioAuth, set_servicio_auth
from src.modulos.favoritos.enrutador import set_servicio_favoritos
from src.modulos.favoritos.servicio import ServicioFavoritos
from src.modulos.reportes.enrutador import set_servicio_reportes
from src.modulos.reportes.servicio import ServicioReportes
from src.modulos.estadisticas.enrutador import set_servicio_estadisticas
from src.modulos.estadisticas.servicio import ServicioEstadisticas


def configurar_servicios() -> None:
    """Configura e inyecta los servicios de chat y signos."""
    ruta_reglas = configuracion.PROLOG_REGLAS_PATH
    if not os.path.isabs(ruta_reglas):
        ruta_reglas = os.path.join(os.path.dirname(__file__), ruta_reglas)

    puente_prolog = PuenteProlog(ruta_reglas)
    agente_ia = AgenteIA(configuracion.ANTHROPIC_API_KEY)

    cliente_gcs = None
    if configuracion.GCP_PROJECT_ID and configuracion.GCS_BUCKET_NAME:
        cliente_gcs = ClienteGCS(
            project_id=configuracion.GCP_PROJECT_ID,
            bucket_name=configuracion.GCS_BUCKET_NAME,
            credentials_path=configuracion.GCS_CREDENTIALS_PATH,
        )

    set_servicio_chat(ServicioChat(puente_prolog, agente_ia, cliente_gcs))
    set_servicio_signos(ServicioSignos(puente_prolog, cliente_gcs))
    set_servicio_auth(ServicioAuth())
    set_servicio_favoritos(ServicioFavoritos())
    set_servicio_reportes(ServicioReportes())
    set_servicio_estadisticas(ServicioEstadisticas())


if __name__ == "__main__":
    configurar_servicios()
    uvicorn.run(
        "aplicacion:app",
        host="0.0.0.0",
        port=configuracion.PORT,
        reload=configuracion.ENVIRONMENT == "development",
    )
