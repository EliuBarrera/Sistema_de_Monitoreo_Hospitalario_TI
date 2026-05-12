# 🏥 Sistema de Monitoreo Hospitalario TI

> Arquitectura de **microservicios** para el monitoreo en tiempo real de dispositivos médicos, métricas de pacientes y alertas clínicas. Desarrollado con **Python/Flask**, **PostgreSQL** y autenticación **JWT**.

---

## 📑 Tabla de Contenidos

- [Descripción General](#descripción-general)
- [Arquitectura](#arquitectura)
- [Requisitos Previos](#requisitos-previos)
- [Instalación y Configuración](#instalación-y-configuración)
- [Variables de Entorno](#variables-de-entorno)
- [Mapa de Puertos](#mapa-de-puertos)
- [Autenticación JWT](#autenticación-jwt)
- [API Reference — Gateway (Puerto 5000)](#api-reference--gateway-puerto-5000)
  - [Auth](#auth)
  - [Users (vía Gateway)](#users-vía-gateway)
  - [Locations (vía Gateway)](#locations-vía-gateway)
  - [Devices (vía Gateway)](#devices-vía-gateway)
  - [Metrics (vía Gateway)](#metrics-vía-gateway)
- [Microservicios Internos](#microservicios-internos)
  - [Auth Service — Puerto 5001](#auth-service--puerto-5001)
  - [Users Service — Puerto 5002](#users-service--puerto-5002)
  - [Devices Service — Puerto 5003](#devices-service--puerto-5003)
  - [Locations Service — Puerto 5004](#locations-service--puerto-5004)
  - [Metrics Service — Puerto 5005](#metrics-service--puerto-5005)
  - [Alerts Service — Puerto 5006](#alerts-service--puerto-5006)
- [Modelos de Datos](#modelos-de-datos)
- [Códigos de Respuesta HTTP](#códigos-de-respuesta-http)
- [Ejecución del Sistema](#ejecución-del-sistema)

---

## Descripción General

Este sistema implementa una arquitectura de microservicios para la gestión hospitalaria de dispositivos médicos, localidades, métricas clínicas y alertas. Un **API Gateway centralizado** actúa como punto de entrada único, valida los tokens JWT y redirige las peticiones a cada microservicio interno.

---

## Arquitectura

```
Cliente (REST)
      │
      ▼
┌─────────────────────┐
│   API Gateway :5000  │  ← Valida JWT · Enruta tráfico
└──────────┬──────────┘
           │
   ┌───────┼────────────────────────┐
   ▼       ▼           ▼           ▼           ▼           ▼
:5001    :5002       :5003       :5004       :5005       :5006
 Auth    Users      Devices   Locations   Metrics     Alerts
Service  Service    Service    Service    Service     Service
   │       │           │           │           │           │
   └───────┴───────────┴───────────┴───────────┴───────────┘
                               │
                    ┌──────────▼──────────┐
                    │   PostgreSQL :5432   │
                    │  microservices_db    │
                    └─────────────────────┘
```

---

## Requisitos Previos

| Herramienta | Versión mínima |
|---|---|
| Python | 3.10+ |
| PostgreSQL | 14+ |
| pip | 23+ |

---

## Instalación y Configuración

```bash
# 1. Clonar el repositorio
git clone <url-del-repositorio>
cd "Proyecto Integrador"

# 2. Crear y activar entorno virtual
python -m venv venv
source venv/bin/activate        # Linux / macOS
# venv\Scripts\activate         # Windows

# 3. Instalar dependencias
pip install -r requirements.txt

# 4. Crear la base de datos en PostgreSQL
psql -U postgres -c "CREATE DATABASE microservices_db;"
```

---

## Variables de Entorno

Crear un archivo `.env` en la raíz del proyecto:

```env
SECRET_KEY=super_secret_key
DATABASE_URL=postgresql+psycopg2://postgres:123456@localhost:5432/microservices_db
```

> ⚠️ **Nunca** subas `.env` al repositorio. Ya está incluido en `.gitignore`.

---

## Mapa de Puertos

| Servicio | Puerto | Prefijo Base |
|---|---|---|
| **API Gateway** | `5000` | `/` |
| Auth Service | `5001` | `/auth` |
| Users Service | `5002` | `/users` |
| Devices Service | `5003` | `/devices`, `/device-types` |
| Locations Service | `5004` | `/locations` |
| Metrics Service | `5005` | `/metrics` |
| Alerts Service | `5006` | `/alerts` |

---

## Autenticación JWT

El Gateway verifica el token en **todos los endpoints protegidos** antes de redirigir la petición.

**Header requerido:**
```
Authorization: Bearer <token>
```

**Algoritmo:** `HS256`  
**Clave:** `SECRET_KEY` del `.env`

| Código | Causa |
|---|---|
| `401` | Token ausente |
| `401` | Token expirado |
| `401` | Token inválido o malformado |

El token se obtiene al hacer login exitoso (`POST /auth/login`).

---

## API Reference — Gateway (Puerto 5000)

> **Base URL:** `http://localhost:5000`  
> 🔓 = Público · 🔐 = Requiere `Authorization: Bearer <token>`

---

### Auth

#### `POST /auth/register` 🔓

Registra un nuevo usuario en el sistema.

**Body (JSON):**
```json
{
  "username": "jdoe",
  "email": "jdoe@hospital.com",
  "password": "SecurePass123",
  "role_id": 1
}
```

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| `username` | string | ✅ | Nombre de usuario único |
| `email` | string | ✅ | Correo electrónico único |
| `password` | string | ✅ | Contraseña en texto plano (se hashea con Werkzeug) |
| `role_id` | integer | ✅ | ID del rol existente |

**Respuesta `201`:**
```json
{
  "message": "Usuario registrado exitosamente",
  "user_id": 1
}
```

**Errores:**
```json
{ "error": "username, email y password son requeridos" }   // 400
{ "error": "El email ya está registrado" }                 // 400
{ "error": "El rol no existe" }                            // 404
```

---

#### `POST /auth/login` 🔓

Autentica un usuario y devuelve un token JWT.

**Body (JSON):**
```json
{
  "email": "jdoe@hospital.com",
  "password": "SecurePass123"
}
```

**Respuesta `200`:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user_id": 1,
  "role_id": 2
}
```

**Errores:**
```json
{ "error": "email y password son requeridos" }  // 400
{ "error": "Usuario no encontrado" }             // 404
{ "error": "Credenciales incorrectas" }          // 401
```

---

### Users (vía Gateway)

> Prefix: `/users` — Todos requieren 🔐

#### `GET /users/<id>` 🔐

Obtiene los datos de un usuario por ID.

**Respuesta `200`:**
```json
{
  "id": 1,
  "username": "jdoe",
  "email": "jdoe@hospital.com",
  "role_id": 2,
  "is_active": true,
  "created_at": "2026-05-01T10:00:00"
}
```

---

#### `PUT /users/<id>` 🔐

Actualiza los datos de un usuario.

**Body (JSON):** Campos a actualizar (todos opcionales).
```json
{
  "username": "john_doe",
  "email": "john@hospital.com"
}
```

---

#### `DELETE /users/<id>` 🔐

Elimina un usuario por ID.

**Respuesta `200`:**
```json
{ "message": "Usuario eliminado" }
```

---

### Locations (vía Gateway)

> Prefix: `/locations` — Todos requieren 🔐

#### `GET /locations` 🔐

Lista todas las ubicaciones.

**Respuesta `200`:**
```json
[
  {
    "id": 1,
    "name": "UCI",
    "building": "Torre A",
    "floor": 3,
    "room": "301",
    "description": "Unidad de Cuidados Intensivos",
    "parent_location_id": null
  }
]
```

---

#### `POST /locations` 🔐

Crea una nueva ubicación.

**Body (JSON):**
```json
{
  "name": "Sala de Espera",
  "building": "Torre B",
  "floor": 1,
  "room": "101",
  "description": "Sala de espera principal",
  "parent_location_id": null
}
```

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| `name` | string | ✅ | Nombre de la ubicación |
| `building` | string | ✅ | Edificio o torre |
| `floor` | integer | ❌ | Piso |
| `room` | string | ❌ | Número o nombre de sala |
| `description` | string | ✅ | Descripción breve |
| `parent_location_id` | integer | ❌ | ID de ubicación padre (jerarquía) |

---

#### `GET /locations/<id>` 🔐

Obtiene una ubicación específica por ID.

---

#### `PUT /locations/<id>` 🔐

Actualiza una ubicación.

**Body (JSON):** Mismos campos que `POST`, todos opcionales.

---

#### `DELETE /locations/<id>` 🔐

Elimina una ubicación por ID.

---

### Devices (vía Gateway)

> Prefix: `/devices` — Todos requieren 🔐

#### `GET /devices` 🔐

Lista todos los dispositivos. Soporta filtros por query params.

**Query Params (opcionales):**

| Parámetro | Tipo | Ejemplo | Descripción |
|---|---|---|---|
| `status` | string | `active` | Filtra por estado del dispositivo |
| `device_type_id` | integer | `2` | Filtra por tipo de dispositivo |
| `serial_number` | string | `SN-00123` | Busca por número de serie |

**Ejemplo:**
```
GET /devices?status=active&device_type_id=1
```

**Respuesta `200`:**
```json
[
  {
    "id": 1,
    "name": "Monitor Cardiaco #1",
    "serial_number": "SN-00123",
    "status": "active",
    "location": "UCI-301",
    "ip_address": "192.168.1.10",
    "device_type_id": 1,
    "created_at": "2026-05-01T08:00:00",
    "updated_at": null
  }
]
```

---

#### `POST /devices` 🔐

Registra un nuevo dispositivo médico.

**Body (JSON):**
```json
{
  "name": "Monitor Cardiaco #2",
  "serial_number": "SN-00124",
  "status": "active",
  "location": "UCI-302",
  "ip_address": "192.168.1.11",
  "device_type_id": 1
}
```

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| `name` | string | ✅ | Nombre descriptivo del dispositivo |
| `serial_number` | string | ✅ | Número de serie único |
| `status` | string | ❌ | `active` (default), `inactive`, `maintenance` |
| `location` | string | ❌ | Ubicación textual del dispositivo |
| `ip_address` | string | ❌ | Dirección IP del dispositivo (máx. 45 chars) |
| `device_type_id` | integer | ❌ | FK al tipo de dispositivo |

---

#### `GET /devices/<device_id>` 🔐

Obtiene un dispositivo específico por ID.

---

#### `PUT /devices/<device_id>` 🔐

Actualiza los datos de un dispositivo.

**Body (JSON):** Mismos campos que `POST`, todos opcionales.

---

#### `DELETE /devices/<device_id>` 🔐

Elimina un dispositivo por ID.

---

### Metrics (vía Gateway)

> Prefix: `/metrics` — Todos requieren 🔐

#### `GET /metrics` 🔐

Lista todas las métricas. Soporta filtros por query params.

**Query Params (opcionales):**

| Parámetro | Tipo | Descripción |
|---|---|---|
| `device_id` | integer | Filtra métricas de un dispositivo |
| `patient_id` | integer | Filtra métricas de un paciente |
| `metric_type` | string | Filtra por tipo de métrica (ej. `heart_rate`) |

**Respuesta `200`:**
```json
[
  {
    "id": 1,
    "device_id": 1,
    "patient_id": 5,
    "metric_type": "heart_rate",
    "value": 78.5,
    "unit": "bpm",
    "timestamp": "2026-05-12T10:30:00",
    "created_at": "2026-05-12T10:30:00",
    "updated_at": null
  }
]
```

---

#### `POST /metrics` 🔐

Registra una nueva métrica clínica.

**Body (JSON):**
```json
{
  "device_id": 1,
  "patient_id": 5,
  "metric_type": "heart_rate",
  "value": 78.5,
  "unit": "bpm",
  "timestamp": "2026-05-12T10:30:00"
}
```

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| `metric_type` | string | ✅ | Tipo de métrica (ej. `heart_rate`, `spo2`, `temperature`) |
| `value` | float | ✅ | Valor numérico de la métrica |
| `device_id` | integer | ❌ | ID del dispositivo que generó la métrica |
| `patient_id` | integer | ❌ | ID del paciente asociado |
| `unit` | string | ❌ | Unidad de medida (ej. `bpm`, `%`, `°C`) |
| `timestamp` | string (ISO 8601) | ❌ | Fecha/hora del registro. Default: `now()` |

---

#### `GET /metrics/<metric_id>` 🔐

Obtiene una métrica específica por ID.

---

#### `PUT /metrics/<metric_id>` 🔐

Actualiza una métrica existente.

---

#### `DELETE /metrics/<metric_id>` 🔐

Elimina una métrica por ID.

---

## Microservicios Internos

> Los siguientes endpoints son **internos** (llamados por el Gateway). Se documentan para facilitar el desarrollo y testing directo.

---

### Auth Service — Puerto 5001

| Método | Endpoint | Auth | Descripción |
|---|---|---|---|
| `POST` | `/auth/register` | 🔓 | Registrar usuario |
| `POST` | `/auth/login` | 🔓 | Login y obtención de JWT |

---

### Users Service — Puerto 5002

| Método | Endpoint | Auth | Descripción |
|---|---|---|---|
| `GET` | `/users/` | 🔓 | Listar todos los usuarios |
| `POST` | `/users/` | 🔓 | Crear usuario |
| `GET` | `/users/<user_id>` | 🔓 | Obtener usuario por ID |
| `PUT` | `/users/<user_id>` | 🔓 | Actualizar usuario |
| `DELETE` | `/users/<user_id>` | 🔓 | Eliminar usuario |
| `GET` | `/users/roles` | 🔓 | Listar todos los roles |
| `POST` | `/users/roles` | 🔓 | Crear un nuevo rol |

**Body `POST /users/roles`:**
```json
{
  "name": "medico",
  "description": "Médico tratante con acceso a métricas"
}
```

---

### Devices Service — Puerto 5003

#### Dispositivos — `/devices`

| Método | Endpoint | Auth | Descripción |
|---|---|---|---|
| `GET` | `/devices/` | 🔓 | Listar dispositivos (filtros: `status`, `device_type_id`, `serial_number`) |
| `GET` | `/devices/<device_id>` | 🔓 | Obtener dispositivo por ID |
| `POST` | `/devices/` | 🔐 | Crear dispositivo |
| `PUT` | `/devices/<device_id>` | 🔐 | Actualizar dispositivo |
| `DELETE` | `/devices/<device_id>` | 🔐 | Eliminar dispositivo |

#### Tipos de Dispositivo — `/device-types`

| Método | Endpoint | Auth | Descripción |
|---|---|---|---|
| `GET` | `/device-types/` | 🔓 | Listar todos los tipos |
| `GET` | `/device-types/<type_id>` | 🔓 | Obtener tipo por ID |
| `POST` | `/device-types/` | 🔐 | Crear tipo de dispositivo |
| `PUT` | `/device-types/<type_id>` | 🔐 | Actualizar tipo de dispositivo |
| `DELETE` | `/device-types/<type_id>` | 🔐 | Eliminar tipo de dispositivo |

**Body `POST /device-types/`:**
```json
{
  "name": "Monitor Cardiaco",
  "description": "Dispositivo para monitoreo de frecuencia cardíaca"
}
```

---

### Locations Service — Puerto 5004

| Método | Endpoint | Auth | Descripción |
|---|---|---|---|
| `GET` | `/locations` | 🔓 | Listar todas las ubicaciones |
| `POST` | `/locations` | 🔓 | Crear ubicación |
| `GET` | `/locations/<id>` | 🔓 | Obtener ubicación por ID |
| `PUT` | `/locations/<id>` | 🔓 | Actualizar ubicación |
| `DELETE` | `/locations/<id>` | 🔓 | Eliminar ubicación |

> 💡 Las ubicaciones soportan **jerarquía** mediante `parent_location_id` (auto-referencia).

---

### Metrics Service — Puerto 5005

| Método | Endpoint | Auth | Descripción |
|---|---|---|---|
| `GET` | `/metrics/` | 🔓 | Listar métricas (filtros opcionales) |
| `GET` | `/metrics/<metric_id>` | 🔓 | Obtener métrica por ID |
| `POST` | `/metrics/` | 🔐 | Registrar nueva métrica |
| `PUT` | `/metrics/<metric_id>` | 🔐 | Actualizar métrica |
| `DELETE` | `/metrics/<metric_id>` | 🔐 | Eliminar métrica |

---

### Alerts Service — Puerto 5006

> ⚠️ Este microservicio **no está enrutado a través del Gateway actualmente**. Se accede directamente en el puerto `5006`.

#### Alertas — `/alerts`

| Método | Endpoint | Auth | Descripción |
|---|---|---|---|
| `GET` | `/alerts/` | 🔓 | Listar todas las alertas |
| `POST` | `/alerts/` | 🔓 | Crear nueva alerta |
| `GET` | `/alerts/<alert_id>` | 🔓 | Obtener alerta por ID |
| `PUT` | `/alerts/<alert_id>` | 🔓 | Actualizar alerta (ej. cambiar estado) |
| `DELETE` | `/alerts/<alert_id>` | 🔓 | Eliminar alerta |
| `GET` | `/alerts/device/<device_id>` | 🔓 | Listar alertas por dispositivo |

**Body `POST /alerts/`:**
```json
{
  "device_id": 1,
  "severity_id": 1,
  "message": "Frecuencia cardíaca fuera de rango: 140 bpm",
  "status": "activa"
}
```

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| `device_id` | integer | ✅ | ID del dispositivo que generó la alerta |
| `message` | string | ✅ | Mensaje descriptivo de la alerta |
| `severity_id` | integer | ❌ | ID de la severidad (FK a `alert_severities`) |
| `status` | string | ❌ | `activa` (default) · `resuelta` · `ignorada` |

#### Severidades — `/alerts/severities`

| Método | Endpoint | Auth | Descripción |
|---|---|---|---|
| `GET` | `/alerts/severities` | 🔓 | Listar todas las severidades |
| `POST` | `/alerts/severities` | 🔓 | Crear severidad |

**Body `POST /alerts/severities`:**
```json
{
  "name": "CRITICA"
}
```

> Valores predefinidos sugeridos: `CRITICA`, `ALTA`, `MEDIA`, `BAJA`

---

## Modelos de Datos

### User / Role (auth_service & users_service)

```
Role
├── id          INTEGER PK
├── name        VARCHAR(50) UNIQUE NOT NULL
└── description VARCHAR(200)

User
├── id          INTEGER PK
├── username    VARCHAR(100) UNIQUE NOT NULL
├── email       VARCHAR(150) UNIQUE NOT NULL
├── password    VARCHAR(300) NOT NULL       ← Hash Werkzeug
├── role_id     INTEGER FK → roles.id
├── is_active   BOOLEAN DEFAULT true
└── created_at  DATETIME
```

### Device / DeviceType (devices_service)

```
DeviceType
├── id          INTEGER PK
├── name        VARCHAR(80) UNIQUE NOT NULL
└── description VARCHAR(255)

Device
├── id             INTEGER PK
├── name           VARCHAR(120) NOT NULL
├── serial_number  VARCHAR(120) UNIQUE NOT NULL
├── status         VARCHAR(30) DEFAULT 'active'
├── location       VARCHAR(120)
├── ip_address     VARCHAR(45)
├── device_type_id INTEGER FK → device_types.id
├── created_at     DATETIME
└── updated_at     DATETIME
```

### Location (locations_service)

```
Location
├── id                 INTEGER PK
├── name               VARCHAR(50) NOT NULL
├── building           VARCHAR(50) NOT NULL
├── floor              INTEGER
├── room               VARCHAR(50)
├── description        VARCHAR(50) NOT NULL
└── parent_location_id INTEGER FK → locations.id  ← Auto-referencia
```

### Metric (metrics_service)

```
Metric
├── id          INTEGER PK
├── device_id   INTEGER
├── patient_id  INTEGER
├── metric_type VARCHAR(80) NOT NULL
├── value       FLOAT NOT NULL
├── unit        VARCHAR(40)
├── timestamp   DATETIME DEFAULT now()
├── created_at  DATETIME DEFAULT now()
└── updated_at  DATETIME
```

### Alert / AlertSeverity (alerts_service)

```
AlertSeverity
├── id   INTEGER PK
└── name VARCHAR(50) UNIQUE NOT NULL

Alert
├── id          INTEGER PK
├── device_id   INTEGER NOT NULL
├── severity_id INTEGER FK → alert_severities.id
├── message     TEXT NOT NULL
├── status      VARCHAR(50) DEFAULT 'activa'
├── created_at  DATETIME
└── resolved_at DATETIME
```

---

## Códigos de Respuesta HTTP

| Código | Significado | Cuándo ocurre |
|---|---|---|
| `200` | OK | Consulta o actualización exitosa |
| `201` | Created | Recurso creado correctamente |
| `400` | Bad Request | Campos requeridos faltantes o datos inválidos |
| `401` | Unauthorized | Token JWT ausente, expirado o inválido |
| `404` | Not Found | El recurso solicitado no existe |
| `500` | Internal Server Error | Error inesperado en el servidor o microservicio |

---

## Ejecución del Sistema

Abrir una terminal por cada microservicio:

```bash
# Terminal 1 — Auth Service
cd backend/auth_service && python app.py

# Terminal 2 — Users Service
cd backend/users_service && python app.py

# Terminal 3 — Devices Service
cd backend/devices_service && python app.py

# Terminal 4 — Locations Service
cd backend/locations_service && python app.py

# Terminal 5 — Metrics Service
cd backend/metrics_service && python app.py

# Terminal 6 — Alerts Service
cd backend/alerts_service && python app.py

# Terminal 7 — API Gateway (iniciar al último)
cd backend/gateway && python app.py
```

> ✅ Todos los microservicios crean automáticamente sus tablas con `db.create_all()` al iniciar.

**Flujo recomendado para testing:**

```
1. POST /auth/register   →  Crear usuario (asegúrate de tener un rol creado)
2. POST /auth/login      →  Obtener token JWT
3. Usar token en header  →  Authorization: Bearer <token>
4. Operar sobre /locations, /devices, /metrics
```

---

## Licencia

Este proyecto está bajo la licencia especificada en el archivo [LICENSE](./LICENSE).

---

*Proyecto Integrador — Desarrollo Orientado a Servicios · USTA 2026*