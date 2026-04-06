from typing import Optional
from src.utils.prolog_bridge import PrologBridge
from src.utils.gcs_client import GCSClient

class SignosService:
    def __init__(self, prolog_bridge: PrologBridge, gcs_client: Optional[GCSClient] = None):
        self.prolog_bridge = prolog_bridge
        self.gcs_client = gcs_client

    def obtener_todos_los_signos(self) -> list:
        signos = self.prolog_bridge.obtener_todos_los_signos()
        
        for signo in signos:
            if self.gcs_client:
                signo['url_video'] = self.gcs_client.obtener_url_video(signo['signo_id'])
            else:
                signo['url_video'] = None
        
        return signos

    def obtener_categorias(self) -> list:
        return self.prolog_bridge.listar_categorias()

    def obtener_signos_por_categoria(self, categoria: str) -> Optional[dict]:
        signos = self.prolog_bridge.obtener_signos_por_categoria(categoria)
        
        if not signos:
            return None
        
        for signo in signos:
            if self.gcs_client:
                signo['url_video'] = self.gcs_client.obtener_url_video(signo['signo_id'])
            else:
                signo['url_video'] = None
        
        return {
            'categoria': categoria,
            'total': len(signos),
            'signos': signos
        }

    def buscar_signo(self, palabra: str) -> dict:
        signo_info = self.prolog_bridge.buscar_signo(palabra)
        categoria_info = self.prolog_bridge.buscar_categoria(palabra)

        resultado = {
            'palabra': palabra,
            'encontrado': signo_info['encontrado'],
            'signo_id': signo_info['signo_id'],
            'categoria': categoria_info['categoria'] if categoria_info['encontrado'] else None,
            'url_video': None
        }

        if signo_info['encontrado'] and self.gcs_client:
            resultado['url_video'] = self.gcs_client.obtener_url_video(signo_info['signo_id'])

        return resultado
