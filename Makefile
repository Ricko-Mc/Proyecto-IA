.PHONY: help dev prod build logs stop clean install shell-frontend logs-frontend

help:
	@echo "LenguaIA - Comandos disponibles"
	@echo ""
	@echo "Docker:"
	@echo "  make dev              - Ejecutar en modo desarrollo"
	@echo "  make prod             - Ejecutar en modo producción"
	@echo "  make build            - Construir imágenes Docker"
	@echo "  make logs             - Ver logs en tiempo real"
	@echo "  make logs-frontend    - Ver logs del frontend"
	@echo "  make stop             - Detener contenedores"
	@echo "  make clean            - Limpiar contenedores e imágenes"
	@echo ""
	@echo "Local:"
	@echo "  make install          - Instalar dependencias locales"
	@echo "  make shell-frontend   - Acceder a shell del frontend (Docker)"

dev:
	docker-compose up -d
	@echo "LenguaIA en desarrollo disponible en http://localhost:5173"

prod:
	docker-compose -f docker-compose.prod.yml up -d
	@echo "LenguaIA en producción disponible en http://localhost"

build:
	docker-compose build --no-cache
	@echo "Imágenes construidas exitosamente"

logs:
	docker-compose logs -f

logs-frontend:
	docker-compose logs -f frontend

stop:
	docker-compose down

clean:
	docker-compose down -v
	docker system prune -f
	@echo "Contenedores e imágenes limpios"

install:
	cd frontend && npm install

shell-frontend:
	docker-compose exec frontend sh
