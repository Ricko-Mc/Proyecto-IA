from fastapi import FastAPI
from src.config.configuracion import configuracion
from src.middleware.cors import configurar_cors
from src.modulos.salud import enrutador as salud_enrutador
from src.modulos.chat import enrutador as chat_enrutador
from src.modulos.signos import enrutador as signos_enrutador
from src.modulos.estadisticas import enrutador as estadisticas_enrutador
from servidor import configurar_servicios

def crear_aplicacion() -> FastAPI:
    aplicacion = FastAPI(
        title=configuracion.PROJECT_NAME,
        version=configuracion.VERSION,
        debug=configuracion.DEBUG,
    )
    configurar_cors(aplicacion)
    aplicacion.include_router(salud_enrutador.router)
    aplicacion.include_router(chat_enrutador.router)
    aplicacion.include_router(signos_enrutador.router)
    aplicacion.include_router(estadisticas_enrutador.router)
    return aplicacion

app = crear_aplicacion()

configurar_servicios()
