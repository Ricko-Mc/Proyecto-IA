# LenguaIA

Agente de IA conversacional para enseñar y comunicar Lengua de Señas de Guatemala (LENSEGUA).

## Características

- Procesamiento de lenguaje natural con Anthropic Claude
- Base de conocimiento en Prolog con 50+ señas LENSEGUA
- Videos de demostración desde Google Cloud Storage
- API REST con FastAPI
- Frontend con React 18, TypeScript y shadcn/ui
- Deploy con Docker y nginx
- Soporte para múltiples categorías (saludos, familia, números, colores, necesidades, tiempo)

## Requisitos Previos

- Docker y Docker Compose
- O alternativamente:
  - Python 3.11+
  - Node.js 20+
  - SWI-Prolog instalado en el sistema

## Configuración Inicial

### 1. Clonar el repositorio

```bash
git clone <repositorio-url>
cd Proyecto-IA
```

### 2. Configurar variables de entorno

Copiar `.env.example` a `.env` y llenar los valores:

```bash
cp .env.example .env
```

Editar `.env` con:
- `ANTHROPIC_API_KEY`: Tu clave API de Anthropic
- `GCP_PROJECT_ID`: Tu proyecto de Google Cloud
- `GCS_BUCKET_NAME`: Nombre del bucket de Google Cloud Storage
- `GCS_CREDENTIALS_PATH`: Ruta al JSON de credenciales de GCP

### 3. Descargar credenciales de GCP (opcional)

Si usarás Google Cloud Storage, descargar el JSON de credenciales:

```bash
# Colocar en la raíz del proyecto
cp /ruta/a/credentials.json .
```

## Instalación y Ejecución

### Con Docker (recomendado)

#### Desarrollo

```bash
make dev
```

La aplicación estará disponible en:
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- Documentación API: http://localhost:8000/docs

#### Producción

```bash
make prod
```

La aplicación estará disponible en http://localhost

### Sin Docker

#### Backend

```bash
cd backend
pip install -r requirements.txt
python server.py
```

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Estructura del Proyecto

```
Proyecto-IA/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── settings.py
│   │   ├── middleware/
│   │   │   └── cors.py
│   │   ├── modules/
│   │   │   ├── chat/
│   │   │   │   ├── router.py
│   │   │   │   ├── service.py
│   │   │   │   └── schemas.py
│   │   │   ├── signos/
│   │   │   │   ├── router.py
│   │   │   │   ├── service.py
│   │   │   │   └── schemas.py
│   │   │   └── health/
│   │   │       └── router.py
│   │   ├── prolog/
│   │   │   ├── knowledge_base.pl
│   │   │   └── rules.pl
│   │   └── utils/
│   │       ├── prolog_bridge.py
│   │       ├── ia_agent.py
│   │       └── gcs_client.py
│   ├── app.py
│   ├── server.py
│   ├── Dockerfile
│   ├── Dockerfile.prod
│   └── requirements.txt
├── frontend/
│   ├── app/
│   │   ├── main.py           # Aplicación FastAPI principal
│   │   ├── prolog_bridge.py  # Interfaz con Prolog
│   │   ├── ia_agent.py       # Agente IA con Anthropic
│   │   ├── gcs_client.py     # Cliente Google Cloud Storage
│   │   └── config.py         # Configuración
│   ├── prolog/
│   │   └── knowledge_base.pl # Base de datos Prolog
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── types/            # Tipos TypeScript
│   │   ├── services/         # Cliente API
│   │   ├── hooks/            # Hooks React
│   │   └── ...              # Componentes existentes
│   ├── Dockerfile
│   └── package.json
├── nginx/
│   └── default.conf          # Configuración nginx
├── docker-compose.yml        # Desarrollo
├── docker-compose.prod.yml   # Producción
├── Makefile                  # Comandos útiles
└── .env.example             # Variables de entorno
```

## Comandos Disponibles

```bash
make dev              # Iniciar desarrollo
make prod             # Iniciar producción
make build            # Construir imágenes
make logs             # Ver todos los logs
make logs-backend     # Ver logs del backend
make logs-frontend    # Ver logs del frontend
make stop             # Detener contenedores
make clean            # Limpiar todo
make install          # Instalar dependencias locales
make shell-backend    # Acceder a bash del backend
make shell-frontend   # Acceder a bash del frontend
```

## API Endpoints

### Chat (principal)

```
POST /api/v1/chat
Content-Type: application/json

{
  "mensaje": "¿Cómo se dice hola en lengua de señas?"
}
```

Respuesta:
```json
{
  "mensaje_usuario": "¿Cómo se dice hola en lengua de señas?",
  "palabra_clave": "hola",
  "signo_encontrado": true,
  "signo_id": "s001",
  "url_video": "https://storage.googleapis.com/.../s001.webm",
  "categoria": "saludos",
  "respuesta_ia": "Aquí está la señal..."
}
```

### Obtener todos los signos

```
GET /api/v1/signos
```

### Obtener categorías

```
GET /api/v1/categorias
```

### Obtener signos por categoría

```
GET /api/v1/categorias/{categoria}
```

### Buscar un signo específico

```
GET /api/v1/signo/{palabra}
```

### Verificar salud de la API

```
GET /api/health
```

## Agregar Nuevos Signos

### 1. Agregar a la base de conocimiento Prolog

Editar `backend/prolog/knowledge_base.pl`:

```prolog
signo(palabra_nueva, categoria, 's999').

sinonimo(palabra_nueva, sinonimo_alternativo).
```

Las categorías disponibles son:
- `saludos`
- `familia`
- `numeros`
- `colores`
- `necesidades`
- `tiempo`

### 2. Subir video a Google Cloud Storage

```bash
gsutil cp mi_seña.webm gs://lengua-ia-videos/videos/s999.webm
```

El archivo debe nombrase como `{signo_id}.webm`.

### 3. Hacer público el video (GCS)

```bash
gsutil acl ch -u AllUsers:R gs://lengua-ia-videos/videos/s999.webm
```

## Deploy en Producción

### Usando Docker Compose

```bash
make prod
```

Esto levantará:
- Backend en puerto 8000 (interno)
- Frontend compilado en nginx
- nginx como proxy inverso en puerto 80

### Usando Kubernetes (opcional)

Se puede containerizar aún más y usar Kubernetes. Consultar documentación específica.

### Variables de entorno en producción

Asegurar que en `.env`:
- `DEBUG=False`
- Credenciales GCP válidas
- API key válida de Anthropic

## Logs y Debugging

Ver logs en tiempo real:

```bash
make logs

make logs-backend

make logs-frontend
```

Acceder a terminal del contenedor:

```bash
make shell-backend
make shell-frontend
```

## Solución de Problemas

### Error: "Failed to resolve import figma:asset"

Este error ya fue solucionado. Los imports de imágenes de Figma fueron convertidos a rutas relativas.

### Error: "ANTHROPIC_API_KEY no válida"

Verificar que la clave esté correctamente establecida en `.env`.

### Error: "GoogleCloud connection failed"

Verificar:
1. Credenciales GCP en el path correcto
2. Permisos de lectura en el bucket
3. Bucket está configurado para acceso público

### Prolog: "Knowledge base not loaded"

Verificar que `PROLOG_KB_PATH` apunta al archivo correcto.

## Tecnologías Utilizadas

### Backend
- **FastAPI**: Framework web asincrónico
- **Pyswip**: Interfaz con Prolog
- **Anthropic SDK**: Integración con Claude AI
- **Google Cloud Storage**: Almacenamiento de videos
- **Pydantic**: Validación de datos

### Frontend
- **React 18**: Librería UI
- **TypeScript**: Tipado estático
- **Vite**: Bundler rápido
- **Tailwind CSS**: Estilos
- **shadcn/ui**: Componentes reutilizables

### Infraestructura
- **Docker**: Containerización
- **Docker Compose**: Orquestación local
- **nginx**: Proxy inverso
- **SWI-Prolog**: Motor de lógica

## Licencia

Proyecto educativo para SEGUA.

## Contacto

Para preguntas o sugerencias, contactar al equipo de desarrollo.
