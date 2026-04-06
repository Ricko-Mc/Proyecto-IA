from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.config.configuracion import configuracion


def configurar_cors(app: FastAPI) -> None:
    """Configura CORS middleware con orígenes permitidos desde configuración."""
    app.add_middleware(
        CORSMiddleware,
        allow_origins=configuracion.origenes_permitidos,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
