#!/usr/bin/env python3
"""
Test directo a Prolog para verificar referencias de YouTube
"""
import os
import sys

# Agregar src al path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

from src.utilidades.puente_prolog import PuenteProlog

# Ruta a reglas.pl
ruta_reglas = os.path.join(os.path.dirname(__file__), 'backend', 'src', 'prolog', 'reglas.pl')

print(f"Cargando Prolog desde: {ruta_reglas}")
print()

try:
    puente = PuenteProlog(ruta_reglas)
    
    # Test 1: Obtener algunos signos
    print("="*60)
    print("TEST 1: Obtener algunos signos de abecedario")
    print("="*60)
    signos = puente.obtener_signos_por_categoria("abecedario")
    print(f"Total signos: {len(signos)}")
    if signos:
        for i, signo in enumerate(signos[:3]):
            print(f"\n  {i+1}. {signo.get('palabra')} ({signo.get('signo_id')})")
    
    # Test 2: Obtener referencia de YouTube para un signo
    print("\n" + "="*60)
    print("TEST 2: Obtener referencia YouTube para ABC001")
    print("="*60)
    ref = puente.obtener_youtube_referencia_por_signo("ABC001")
    print(f"Referencia: {ref}")
    print(f"Tipo: {type(ref)}")
    print(f"Es None: {ref is None}")
    print(f"Está vacía: {not ref if ref else 'N/A'}")
    
    # Test 3: Construir URL embed
    print("\n" + "="*60)
    print("TEST 3: Construir URL embed")
    print("="*60)
    from src.utilidades.youtube import construir_url_embed_youtube
    if ref:
        url = construir_url_embed_youtube(ref)
        print(f"URL construida: {url}")
    else:
        print("⚠ Referencia es None, no se puede construir URL")
    
    # Test 4: Verificar varios signos de colores
    print("\n" + "="*60)
    print("TEST 4: Verificar referencias de colores")
    print("="*60)
    colores = puente.obtener_signos_por_categoria("colores")
    print(f"Total signos en colores: {len(colores)}")
    for i, signo in enumerate(colores[:5]):
        signo_id = signo.get('signo_id')
        ref = puente.obtener_youtube_referencia_por_signo(signo_id)
        print(f"\n  {i+1}. {signo.get('palabra')} ({signo_id})")
        print(f"     Referencia: {ref}")
    
    print("\n" + "="*60)
    print("✓ Test completado")
    print("="*60)
    
except Exception as e:
    print(f"✗ Error: {e}")
    import traceback
    traceback.print_exc()
