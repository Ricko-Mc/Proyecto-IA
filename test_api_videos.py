#!/usr/bin/env python3
"""
Script para verificar qué está retornando el API de categorías con URLs de videos
"""
import requests
import json

BASE_URL = "http://localhost:8000/api"

def test_category(categoria: str):
    """Test obtener signos de una categoría"""
    print(f"\n{'='*60}")
    print(f"TESTEANDO CATEGORÍA: {categoria}")
    print('='*60)
    
    url = f"{BASE_URL}/categorias/{categoria}"
    try:
        resp = requests.get(url, timeout=10)
        resp.raise_for_status()
        data = resp.json()
        
        print(f"✓ Status: {resp.status_code}")
        print(f"✓ Total signos: {data.get('total', 0)}")
        
        signos = data.get('signos', [])
        if signos:
            print(f"\nPrimeros 3 signos:")
            for signo in signos[:3]:
                print(f"\n  Palabra: {signo.get('palabra')}")
                print(f"  ID: {signo.get('signo_id')}")
                print(f"  URL Video: {signo.get('url_video')}")
                if signo.get('url_video'):
                    # Verificar si la URL es válida
                    video_url = signo.get('url_video')
                    if 'youtube' in video_url:
                        print(f"  ✓ URL contiene 'youtube'")
                    else:
                        print(f"  ✗ URL NO contiene 'youtube'")
        else:
            print("⚠ No se encontraron signos")
            
    except requests.exceptions.RequestException as e:
        print(f"✗ Error: {e}")

def test_memoria_pares(categoria: str):
    """Test obtener pares para memoria"""
    print(f"\n{'='*60}")
    print(f"TESTEANDO MEMORIA-PARES: {categoria}")
    print('='*60)
    
    url = f"{BASE_URL}/memoria-pares?categoria={categoria}"
    try:
        resp = requests.get(url, timeout=10)
        resp.raise_for_status()
        data = resp.json()
        
        print(f"✓ Status: {resp.status_code}")
        print(f"✓ Total pares: {len(data)}")
        
        if data:
            print(f"\nPrimeros 3 pares:")
            for par in data[:3]:
                print(f"\n  Palabra: {par.get('palabra')}")
                print(f"  URL Video: {par.get('url_video')}")
        else:
            print("⚠ No se encontraron pares")
            
    except requests.exceptions.RequestException as e:
        print(f"✗ Error: {e}")

if __name__ == "__main__":
    # Probar las categorías principales
    categorias = ['abecedario', 'colores', 'animales', 'alimentos', 'saludos']
    
    for cat in categorias:
        test_category(cat)
    
    print(f"\n\n{'='*60}")
    print("TESTEANDO MEMORIA-PARES")
    print('='*60)
    
    for cat in categorias:
        test_memoria_pares(cat)
    
    print("\n\n✓ Test completado")
