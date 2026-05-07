#!/usr/bin/env python3
"""
Quick test to verify the YouTube references are being fetched correctly
"""
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

from src.utilidades.puente_prolog import PuenteProlog
from src.utilidades.youtube import construir_url_embed_youtube

ruta_reglas = os.path.join(os.path.dirname(__file__), 'backend', 'src', 'prolog', 'reglas.pl')

try:
    print("Inicializando puente Prolog...")
    puente = PuenteProlog(ruta_reglas)
    
    print("\n" + "="*70)
    print("TEST: Verificar que video_youtube está siendo consultado correctamente")
    print("="*70)
    
    # Obtener un signo
    print("\n1. Obteniendo signos de abecedario...")
    signos = puente.obtener_signos_por_categoria("abecedario")
    print(f"   Total: {len(signos)}")
    
    if signos:
        signo = signos[0]
        print(f"\n2. Primer signo:")
        print(f"   Palabra: {signo['palabra']}")
        print(f"   Categoría: {signo['categoria']}")
        print(f"   SigID (raw): '{signo['signo_id']}'")
        print(f"   SigID type: {type(signo['signo_id'])}")
        print(f"   SigID repr: {repr(signo['signo_id'])}")
        
        # Obtener referencia de YouTube
        print(f"\n3. Obteniendo referencia YouTube para '{signo['signo_id']}'...")
        ref = puente.obtener_youtube_referencia_por_signo(signo['signo_id'])
        print(f"   Referencia (raw): '{ref}'")
        print(f"   Referencia type: {type(ref)}")
        if ref:
            print(f"   Referencia repr: {repr(ref)}")
            
            # Construir URL
            print(f"\n4. Construyendo URL embed...")
            url = construir_url_embed_youtube(ref)
            print(f"   URL: {url[:100]}..." if url and len(url) > 100 else f"   URL: {url}")
        else:
            print("   ⚠ Referencia es None o vacía")
    
    print("\n" + "="*70)
    print("✓ Test completado")
    print("="*70)
    
except Exception as e:
    print(f"✗ Error: {e}")
    import traceback
    traceback.print_exc()
