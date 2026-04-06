.PHONY: help dev prod build logs stop clean install backend-dev backend-shell shell-backend shell-frontend

help:
	@echo "LenguaIA - Comandos disponibles"
	@echo ""
	@echo "Docker:"
	@echo "  make dev              - Ejecutar en modo desarrollo"
	@echo "  make prod             - Ejecutar en modo producción"
	@echo "  make build            - Construir imágenes Docker"
	@echo "  make logs             - Ver logs en tiempo real"
	@echo "  make logs-backend     - Ver logs del backend"
	@echo "  make logs-frontend    - Ver logs del frontend"
	@echo "  make stop             - Detener contenedores"
	@echo "  make clean            - Limpiar contenedores e imágenes"
	@echo ""
	@echo "Local:"
	@echo "  make install          - Instalar dependencias locales"
	@echo "  make backend-dev      - Ejecutar backend localmente (python server.py)"
	@echo "  make shell-backend    - Acceder a shell del backend (Docker)"
	@echo "  make shell-frontend   - Acceder a shell del frontend (Docker)"

dev:
	docker-compose up -d
	@echo "LenguaIA en desarrollo disponible en http://localhost:5173"
	@echo "Backend disponible en http://localhost:8000"

prod:
	docker-compose -f docker-compose.prod.yml up -d
	@echo "LenguaIA en producción disponible en http://localhost"

build:
	docker-compose build --no-cache
	@echo "Imágenes construidas exitosamente"

logs:
	docker-compose logs -f

logs-backend:
	docker-compose logs -f backend

logs-frontend:
	docker-compose logs -f frontend

stop:
	docker-compose down

clean:
	docker-compose down -v
	docker system prune -f
	@echo "Contenedores e imágenes limpios"

install:
	cd backend && pip install -r requirements.txt
	cd frontend && npm install

shell-backend:
	docker-compose exec backend sh

shell-frontend:
	docker-compose exec frontend sh

backend-dev:
	cd backend && python server.py

backend-shell:
	docker-compose exec backend sh
