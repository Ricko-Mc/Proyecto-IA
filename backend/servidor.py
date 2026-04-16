import os
import uvicorn
from src.config.configuracion import configuracion
from src.utilidades.puente_prolog import PuenteProlog
from src.utilidades.agente_ia import AgenteIA
from src.modulos.chat.enrutador import set_servicio_chat
from src.modulos.chat.servicio import ServicioChat
from src.modulos.estadisticas.enrutador import set_servicio_estadisticas
from src.modulos.estadisticas.servicio import ServicioEstadisticas
from src.modulos.signos.enrutador import set_servicio_signos
from src.modulos.signos.servicio import ServicioSignos

def configurar_servicios() -> None:
    """Configura e inyecta los servicios de chat, signos y estadísticas."""
    ruta_reglas = configuracion.PROLOG_REGLAS_PATH
    if not os.path.isabs(ruta_reglas):
        ruta_reglas = os.path.join(os.path.dirname(__file__), ruta_reglas)

    puente_prolog = PuenteProlog(ruta_reglas)
    agente_ia = AgenteIA(configuracion.ANTHROPIC_API_KEY)

    set_servicio_chat(ServicioChat(puente_prolog, agente_ia))
    set_servicio_signos(ServicioSignos(puente_prolog))
    set_servicio_estadisticas(ServicioEstadisticas())

if __name__ == "__main__":
    uvicorn.run(
        "aplicacion:app",
        host="0.0.0.0",
        port=configuracion.PORT,
        reload=configuracion.ENVIRONMENT == "development",
    )
