import os
from typing import Optional
from google.cloud import storage

class GCSClient:
    def __init__(self, project_id: str = None, bucket_name: str = None):
        self.project_id = project_id or os.getenv("GCP_PROJECT_ID")
        self.bucket_name = bucket_name or os.getenv("GCS_BUCKET_NAME")
        
        gcs_credentials_path = os.getenv("GCS_CREDENTIALS_PATH")
        if gcs_credentials_path and os.path.exists(gcs_credentials_path):
            os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = gcs_credentials_path
        
        self.storage_client = storage.Client(project=self.project_id)
        self.bucket = self.storage_client.bucket(self.bucket_name)

    def obtener_url_video(self, signo_id: str) -> Optional[str]:
        nombre_archivo = f"{signo_id}.webm"
        blob = self.bucket.blob(f"videos/{nombre_archivo}")
        
        if blob.exists():
            url = f"https://storage.googleapis.com/{self.bucket_name}/videos/{nombre_archivo}"
            return url
        
        return None

    def existe_video(self, signo_id: str) -> bool:
        nombre_archivo = f"{signo_id}.webm"
        blob = self.bucket.blob(f"videos/{nombre_archivo}")
        return blob.exists()

    def listar_videos(self) -> list:
        blobs = self.storage_client.list_blobs(self.bucket_name, prefix="videos/")
        videos = []
        
        for blob in blobs:
            if blob.name.endswith(".webm"):
                signo_id = blob.name.split("/")[-1].replace(".webm", "")
                url = f"https://storage.googleapis.com/{self.bucket_name}/{blob.name}"
                videos.append({
                    'signo_id': signo_id,
                    'url': url,
                    'nombre': blob.name,
                    'tamanio': blob.size
                })
        
        return videos

    def obtener_info_video(self, signo_id: str) -> Optional[dict]:
        nombre_archivo = f"{signo_id}.webm"
        blob = self.bucket.blob(f"videos/{nombre_archivo}")
        
        if blob.exists():
            blob.reload()
            return {
                'signo_id': signo_id,
                'url': self.obtener_url_video(signo_id),
                'tamanio': blob.size,
                'actualizado': blob.updated.isoformat() if blob.updated else None,
                'content_type': blob.content_type
            }
        
        return None
