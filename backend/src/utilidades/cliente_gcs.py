import os
from typing import Optional
from google.cloud import storage


class ClienteGCS:
    def __init__(self, project_id: str, bucket_name: str, credentials_path: str = ""):
        """Inicializa cliente GCS con credenciales y configura el bucket."""
        self.bucket_name = bucket_name
        if credentials_path and os.path.exists(credentials_path):
            os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = credentials_path
        self.storage_client = storage.Client(project=project_id)
        self.bucket = self.storage_client.bucket(bucket_name)

    def obtener_url_video(self, signo_id: str) -> Optional[str]:
        """Obtiene la URL pública de un video en Google Cloud Storage por signo_id."""
        nombre_archivo = f"{signo_id}.webm"
        blob = self.bucket.blob(f"videos/{nombre_archivo}")
        if blob.exists():
            url = (
                f"https://storage.googleapis.com/"
                f"{self.bucket_name}/videos/{nombre_archivo}"
            )
            return url
        return None
