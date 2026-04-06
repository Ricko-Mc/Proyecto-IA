from fastapi import FastAPI
from src.config.settings import settings
from src.middleware.cors import setup_cors
from src.modules.health import router as health_router
from src.modules.signos import router as signos_router
from src.modules.chat import router as chat_router

def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.PROJECT_NAME,
        version=settings.VERSION,
        debug=settings.DEBUG
    )

    setup_cors(app)

    app.include_router(health_router.router)
    app.include_router(chat_router.router)
    app.include_router(signos_router.router)

    return app

app = create_app()
