import sys
sys.path.insert(0, '.')

try:
    from backend.src.utilidades.puente_prolog import PuenteProlog
    
    print("1. Inicializando PuenteProlog...")
    puente = PuenteProlog('backend/src/prolog/reglas.pl')
    print("   OK")
    
    print("2. Obteniendo todos los signos con YouTube (método nuevo)...")
    signos = puente.obtener_todos_signos_categoria_con_youtube('abecedario')
    print(f"   OK - {len(signos)} signos encontrados")
    
    if signos:
        print("3. Primeros 3 signos:")
        for signo in signos[:3]:
            print(f"   - {signo['palabra']}: {signo['youtube_ref']}")
            
except Exception as e:
    print(f"ERROR: {e}")
    import traceback
    traceback.print_exc()
