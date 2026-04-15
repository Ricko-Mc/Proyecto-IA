from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.config.configuracion import configuracion

def configurar_cors(app: FastAPI) -> None:
    """Configura CORS middleware con orígenes permitidos desde configuración."""
    allow_origin_regex = r"https?://localhost(:\d+)?$" if configuracion.ENVIRONMENT == "development" else None
    app.add_middleware(
        CORSMiddleware,
        allow_origins=configuracion.origenes_permitidos,
        allow_origin_regex=allow_origin_regex,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
