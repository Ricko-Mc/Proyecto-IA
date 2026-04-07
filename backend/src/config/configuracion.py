from pydantic_settings import BaseSettings


class Configuracion(BaseSettings):
    PROJECT_NAME: str = "LenguaIA"
    VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"
    PORT: int = 8000
    DEBUG: bool = True

    ANTHROPIC_API_KEY: str = ""
    GCP_PROJECT_ID: str = ""
    GCS_BUCKET_NAME: str = ""
    GCS_CREDENTIALS_PATH: str = ""
    SUPABASE_URL: str = ""
    SUPABASE_KEY: str = ""
    SUPABASE_ANON_KEY: str = ""
    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""
    FRONTEND_URL: str = "http://localhost:5173"
    ALLOWED_ORIGINS: str = "http://localhost:5173,http://localhost:3000"
    PROLOG_REGLAS_PATH: str = "src/prolog/reglas.pl"

    class Config:
        env_file = ".env"
        case_sensitive = True

    @property
    def origenes_permitidos(self) -> list[str]:
        """Retorna lista de orígenes CORS permitidos parseados desde ALLOWED_ORIGINS."""
        return [origen.strip() for origen in self.ALLOWED_ORIGINS.split(",") if origen.strip()]


configuracion = Configuracion()
