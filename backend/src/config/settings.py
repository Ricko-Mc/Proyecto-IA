from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "LenguaIA"
    VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"
    PORT: int = 8000
    DEBUG: bool = True

    ANTHROPIC_API_KEY: str = ""
    
    GCP_PROJECT_ID: str = ""
    GCS_BUCKET_NAME: str = ""
    GCS_CREDENTIALS_PATH: str = ""

    ALLOWED_ORIGINS: list = ["http://localhost:5173", "http://localhost:3000"]

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
