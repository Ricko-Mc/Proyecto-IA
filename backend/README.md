# Backend - LenguaIA

API REST con FastAPI para la Lengua de Señas de Guatemala.

## Estructura

```
backend/
├── src/
│   ├── config/
│   │   └── settings.py           # Configuración centralizada
│   ├── middleware/
│   │   └── cors.py               # Configuración CORS
│   ├── modules/
│   │   ├── chat/                 # Módulo de chat
│   │   │   ├── router.py
│   │   │   ├── service.py
│   │   │   └── schemas.py
│   │   ├── signos/               # Módulo de signos
│   │   │   ├── router.py
│   │   │   ├── service.py
│   │   │   └── schemas.py
│   │   └── health/               # Health check
│   │       └── router.py
│   ├── prolog/
│   │   ├── knowledge_base.pl     # Base de datos
│   │   └── rules.pl              # Reglas Prolog
│   └── utils/
│       ├── prolog_bridge.py      # Interfaz Prolog
│       ├── ia_agent.py           # Agente IA
│       └── gcs_client.py         # Cliente GCS
├── app.py                         # Instancia FastAPI
├── server.py                      # Punto de entrada
├── Dockerfile                     # Desarrollo
├── Dockerfile.prod                # Producción
├── requirements.txt
└── .env
```

## Instalación Local

### 1. Configurar .env

```bash
ENVIRONMENT=development
PORT=8000
DEBUG=True

ANTHROPIC_API_KEY=sk_...
GCP_PROJECT_ID=tu-proyecto
GCS_BUCKET_NAME=tu-bucket
```

### 2. Instalar dependencias

```bash
pip install -r requirements.txt
```

### 3. Ejecutar servidor

```bash
python server.py
```

API disponible en: http://localhost:8000

## Endpoints

### Health
```
GET /api/health
```

### Chat
```
POST /api/chat
{ "mensaje": "¿Cómo se dice hola?" }
```

### Signos
```
GET /api/signos
GET /api/categorias
GET /api/categorias/{categoria}
GET /api/signo/{palabra}
```

## Arquitectura Modular

### Módulos

- **chat**: Procesa mensajes, extrae palabras clave con IA
- **signos**: Lista y busca signos en la base de conocimiento
- **health**: Verifica estado del sistema

### Servicios (Services)

Orquestan la lógica de negocio usando utilidades.

### Utilidades (Utils)

- **PrologBridge**: Interfaz con motor Prolog
- **LenguaIAAgent**: Integración con Claude API
- **GCSClient**: Gestión de videos en GCS

## Development

Todos los cambios en `src/` aplican instantáneamente.

Logs disponibles en consola.

## Production

Usar `Dockerfile.prod` con variables de entorno en `.env` de producción.
