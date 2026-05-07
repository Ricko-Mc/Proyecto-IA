import sys
sys.path.insert(0, '.')

from backend.src.utilidades.puente_prolog import PuenteProlog
from backend.src.utilidades.youtube import construir_url_embed_youtube

try:
    puente = PuenteProlog('backend/src/prolog/reglas.pl')
    signos = puente.obtener_signos_por_categoria('abecedario')
    
    print(f'Total signos: {len(signos)}')
    print(f'\nProbando URLs para los primeros 3 signos:')
    
    for signo in signos[:3]:
        print(f"\nSigno: {signo['palabra']} ({signo['signo_id']})")
        try:
            youtube_ref = puente.obtener_youtube_referencia_por_signo(signo['signo_id'])
            print(f"  YouTube ref: {youtube_ref}")
            url_embed = construir_url_embed_youtube(youtube_ref)
            print(f"  URL embed: {url_embed}")
        except Exception as e:
            print(f"  Error: {e}")
            import traceback
            traceback.print_exc()
            
except Exception as e:
    print(f'Error principal: {e}')
    import traceback
    traceback.print_exc()
