import re
import unicodedata
from typing import Optional
from pyswip import Prolog

class PrologBridge:
    def __init__(self, rules_path: str):
        self.prolog = Prolog()
        self.prolog.consult(rules_path)

    def normalizar_texto(self, texto: str) -> str:
        texto = texto.lower().strip()
        texto = unicodedata.normalize('NFD', texto)
        texto = ''.join(char for char in texto if unicodedata.category(char) != 'Mn')
        texto = re.sub(r'[^a-z0-9_\s]', '', texto)
        texto = re.sub(r'\s+', '_', texto)
        return texto

    def buscar_signo(self, palabra: str) -> Optional[dict]:
        palabra_normalizada = self.normalizar_texto(palabra)
        
        try:
            lista_resultados = list(self.prolog.query(f"buscar_signo({palabra_normalizada}, SigID)"))
            
            if lista_resultados:
                sig_id = lista_resultados[0]['SigID']
                return {
                    'encontrado': True,
                    'palabra': palabra_normalizada,
                    'signo_id': sig_id
                }
        except Exception as e:
            return None
        
        return {
            'encontrado': False,
            'palabra': palabra_normalizada,
            'signo_id': None
        }

    def buscar_categoria(self, palabra: str) -> Optional[dict]:
        palabra_normalizada = self.normalizar_texto(palabra)
        
        try:
            lista_resultados = list(self.prolog.query(f"buscar_categoria({palabra_normalizada}, Categoria)"))
            
            if lista_resultados:
                categoria = lista_resultados[0]['Categoria']
                return {
                    'encontrado': True,
                    'palabra': palabra_normalizada,
                    'categoria': categoria
                }
        except Exception as e:
            return None
        
        return {
            'encontrado': False,
            'palabra': palabra_normalizada,
            'categoria': None
        }

    def listar_categorias(self) -> list:
        categorias_set = set()
        
        try:
            lista_resultados = list(self.prolog.query("signo(_, Categoria, _)"))
            
            for resultado in lista_resultados:
                categorias_set.add(resultado['Categoria'])
        except Exception as e:
            return []
        
        return sorted(list(categorias_set))

    def obtener_signos_por_categoria(self, categoria: str) -> list:
        try:
            lista_resultados = list(self.prolog.query(f"signo(Palabra, {categoria}, SigID)"))
            
            signos = []
            for resultado in lista_resultados:
                signos.append({
                    'palabra': resultado['Palabra'],
                    'categoria': categoria,
                    'signo_id': resultado['SigID']
                })
            
            return signos
        except Exception as e:
            return []

    def obtener_todos_los_signos(self) -> list:
        try:
            lista_resultados = list(self.prolog.query("signo(Palabra, Categoria, SigID)"))
            
            signos = []
            for resultado in lista_resultados:
                signos.append({
                    'palabra': resultado['Palabra'],
                    'categoria': resultado['Categoria'],
                    'signo_id': resultado['SigID']
                })
            
            return signos
        except Exception as e:
            return []
