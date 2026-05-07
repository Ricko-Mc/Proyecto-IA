import urllib.request
import json
import time

time.sleep(3)
print("Haciendo solicitud a http://localhost:8000/api/chat...")

try:
    url = 'http://localhost:8000/api/chat'
    data = json.dumps({'mensaje': 'abecedario completo'}).encode('utf-8')
    req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json'})
    
    response = urllib.request.urlopen(req, timeout=30)
    response_data = json.loads(response.read().decode('utf-8'))
    
    print(f"✓ tipo_respuesta: {response_data.get('tipo_respuesta')}")
    print(f"✓ palabra_clave: {response_data.get('palabra_clave')}")
    
    compilacion = response_data.get('videos_compilacion', [])
    print(f"✓ videos_compilacion count: {len(compilacion)}")
    
    if compilacion:
        print("\nPrimeros 5 videos:")
        for video in compilacion[:5]:
            url_preview = video['url_video'][:50] if video['url_video'] else 'None'
            print(f"  - {video['palabra']}: {url_preview}...")
            
except Exception as e:
    print(f"✗ Error: {e}")
    import traceback
    traceback.print_exc()
