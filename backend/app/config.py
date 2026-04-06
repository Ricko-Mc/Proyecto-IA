import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "LenguaIA"
    VERSION: str = "1.0.0"
    API_VERSION: str = "v1"
    DEBUG: bool = os.getenv("DEBUG", "False").lower() == "true"

    BACKEND_CORS_ORIGINS: list = ["http://localhost:5173", "http://localhost:3000", "*"]

    ANTHROPIC_API_KEY: str = os.getenv("ANTHROPIC_API_KEY", "")
    
    GCP_PROJECT_ID: str = os.getenv("GCP_PROJECT_ID", "")
    GCS_BUCKET_NAME: str = os.getenv("GCS_BUCKET_NAME", "")
    GCS_CREDENTIALS_PATH: str = os.getenv("GCS_CREDENTIALS_PATH", "")

    PROLOG_KB_PATH: str = os.getenv("PROLOG_KB_PATH", "/app/prolog/knowledge_base.pl")

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
