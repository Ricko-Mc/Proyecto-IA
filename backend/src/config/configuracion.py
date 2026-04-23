from pydantic_settings import BaseSettings, SettingsConfigDict

class Configuracion(BaseSettings):
    PROJECT_NAME: str = "LenguaIA"
    VERSION: str = "1.0.0"
    ENVIRONMENT: str = "production"
    PORT: int = 8000
    DEBUG: bool = False

    ANTHROPIC_API_KEY: str = ""
    FRONTEND_URL: str = "http://localhost:5174"
    ALLOWED_ORIGINS: str = "http://localhost:5173,http://localhost:5174,http://localhost:3000"
    PROLOG_REGLAS_PATH: str = "src/prolog/reglas.pl"

    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=True,
        extra="ignore",
    )

    @property
    def origenes_permitidos(self) -> list[str]:
        """Retorna lista de orígenes CORS permitidos parseados desde ALLOWED_ORIGINS."""
        return [origen.strip() for origen in self.ALLOWED_ORIGINS.split(",") if origen.strip()]

configuracion = Configuracion()
