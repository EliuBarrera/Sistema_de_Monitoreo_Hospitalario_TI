# 🧪 Guía de Pruebas — Postman + Docker

> **Base URL:** `http://localhost:5000`  
> Todos los requests van al **Gateway**. Nunca llames directamente a los puertos 5001–5006 en pruebas normales.

---

## ⚙️ Paso 0 — Levantar el sistema con Docker

```bash
# 1. Copiar el archivo de variables de entorno
cp .env.example .env

# 2. Construir y levantar todos los servicios
docker-compose up --build
```

Espera hasta ver en la consola algo como:
```
auth_service     | * Running on http://0.0.0.0:5001
users_service    | * Running on http://0.0.0.0:5002
devices_service  | * Running on http://0.0.0.0:5003
locations_service| * Running on http://0.0.0.0:5004
metrics_service  | * Running on http://0.0.0.0:5005
alerts_service   | * Running on http://0.0.0.0:5006
gateway          | * Running on http://0.0.0.0:5000
```

> ⚠️ Si algún servicio falla al arrancar, revisa los logs con:  
> `docker-compose logs <nombre_servicio>`

---

## 📋 Configuración en Postman

### Variable de entorno (recomendado)

En Postman crea un **Environment** llamado `Hospital Docker` con estas variables:

| Variable | Valor inicial |
|---|---|
| `base_url` | `http://localhost:5000` |
| `token` | *(se llena automáticamente con el script del login)* |

Así todos los requests usan `{{base_url}}/...` y `{{token}}`.

---

## 🔐 FASE 1 — Inicialización (sin token)

> Estos pasos son **obligatorios** antes de cualquier otra prueba. La BD arranca vacía.

---

### 1.1 — Crear un Rol

> **Nota:** Este request va directo al `users_service` (sin pasar por el gateway) porque crear el primer rol necesita hacerse antes de tener un usuario administrador.

**Método:** `POST`  
**URL:** `http://localhost:5002/users/roles`  
**Headers:**
```
Content-Type: application/json
```
**Body → raw → JSON:**
```json
{
  "name": "admin",
  "description": "Administrador del sistema"
}
```
**Respuesta esperada `201`:**
```json
{
  "message": "Rol creado",
  "id": 1
}
```

Puedes crear más roles si quieres:
```json
{ "name": "tecnico", "description": "Técnico de TI" }
{ "name": "enfermero", "description": "Personal de enfermería" }
```

---

### 1.2 — Registrar el primer usuario

**Método:** `POST`  
**URL:** `{{base_url}}/auth/register`  
**Headers:**
```
Content-Type: application/json
```
**Body → raw → JSON:**
```json
{
  "username": "admin",
  "email": "admin@hospital.com",
  "password": "Admin123",
  "role_id": 1
}
```
**Respuesta esperada `201`:**
```json
{
  "message": "Usuario registrado exitosamente",
  "user_id": 1
}
```

**Errores comunes:**
| Error | Causa |
|---|---|
| `404 "El rol no existe"` | No hiciste el paso 1.1, o `role_id` incorrecto |
| `400 "El email ya está registrado"` | Ya existe ese email en la BD |
| `400 "El username ya está en uso"` | Ya existe ese username |

---

### 1.3 — Login → obtener token JWT

**Método:** `POST`  
**URL:** `{{base_url}}/auth/login`  
**Headers:**
```
Content-Type: application/json
```
**Body → raw → JSON:**
```json
{
  "email": "admin@hospital.com",
  "password": "Admin123"
}
```
**Respuesta esperada `200`:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user_id": 1,
  "role": "admin"
}
```

#### 💡 Guardar el token automáticamente en Postman

En el request de login, ve a la pestaña **Tests** y añade este script:
```javascript
var response = pm.response.json();
if (response.token) {
    pm.environment.set("token", response.token);
    console.log("Token guardado:", response.token);
}
```
Así la variable `{{token}}` se llena sola después de cada login.

---

## 🔑 Cómo usar el token en los siguientes requests

En cada request protegido, ve a la pestaña **Authorization**:
- **Type:** `Bearer Token`
- **Token:** `{{token}}`

O manualmente en **Headers**:
```
Authorization: Bearer {{token}}
```

> El token expira en **1 hora**. Si recibes `401 Token expirado`, repite el paso 1.3.

---

## 👤 FASE 2 — Users (🔐 requiere token)

---

### 2.1 — Listar todos los usuarios

**Método:** `GET`  
**URL:** `{{base_url}}/users`  
**Respuesta esperada `200`:**
```json
[
  {
    "id": 1,
    "username": "admin",
    "email": "admin@hospital.com",
    "role_id": 1,
    "is_active": true,
    "created_at": "2026-05-14T20:00:00"
  }
]
```

---

### 2.2 — Obtener usuario por ID

**Método:** `GET`  
**URL:** `{{base_url}}/users/1`  
**Respuesta esperada `200`:** *(datos del usuario con id 1)*

---

### 2.3 — Actualizar usuario

**Método:** `PUT`  
**URL:** `{{base_url}}/users/1`  
**Body → raw → JSON:**
```json
{
  "username": "admin_updated",
  "is_active": true
}
```
**Respuesta esperada `200`:**
```json
{ "message": "Usuario actualizado" }
```

---

### 2.4 — Listar roles (vía gateway)

**Método:** `GET`  
**URL:** `{{base_url}}/users/roles`  
**Respuesta esperada `200`:**
```json
[
  { "id": 1, "name": "admin", "description": "Administrador del sistema" }
]
```

---

### 2.5 — Crear rol (vía gateway)

**Método:** `POST`  
**URL:** `{{base_url}}/users/roles`  
**Body → raw → JSON:**
```json
{
  "name": "tecnico",
  "description": "Técnico de TI"
}
```
**Respuesta esperada `201`:**
```json
{ "message": "Rol creado", "id": 2 }
```

---

## 🏥 FASE 3 — Locations (🔐 requiere token)

---

### 3.1 — Crear ubicación raíz

**Método:** `POST`  
**URL:** `{{base_url}}/locations`  
**Body → raw → JSON:**
```json
{
  "name": "Torre A",
  "building": "Torre A",
  "floor": 1,
  "room": "General",
  "description": "Edificio principal del hospital",
  "parent_location_id": null
}
```
**Respuesta esperada `201`:**
```json
{
  "location": { "id": 1, "name": "Torre A", ... },
  "message": "Location created successfully"
}
```

---

### 3.2 — Crear sub-ubicación (con padre)

**Método:** `POST`  
**URL:** `{{base_url}}/locations`  
**Body → raw → JSON:**
```json
{
  "name": "UCI",
  "building": "Torre A",
  "floor": 3,
  "room": "301",
  "description": "Unidad de Cuidados Intensivos",
  "parent_location_id": 1
}
```

---

### 3.3 — Listar ubicaciones

**Método:** `GET`  
**URL:** `{{base_url}}/locations`

---

### 3.4 — Obtener ubicación por ID

**Método:** `GET`  
**URL:** `{{base_url}}/locations/1`

---

### 3.5 — Actualizar ubicación

**Método:** `PUT`  
**URL:** `{{base_url}}/locations/1`  
**Body → raw → JSON:**
```json
{
  "description": "Descripción actualizada"
}
```

---

### 3.6 — Eliminar ubicación

**Método:** `DELETE`  
**URL:** `{{base_url}}/locations/2`

> ⚠️ No puedes eliminar una ubicación que tenga sub-ubicaciones hijas. Elimina primero las hijas.

---

## 🖥️ FASE 4 — Device Types (🔐 requiere token)

> Crea primero los tipos antes de crear dispositivos.

---

### 4.1 — Crear tipo de dispositivo

**Método:** `POST`  
**URL:** `{{base_url}}/device-types`  
**Body → raw → JSON:**
```json
{
  "name": "Monitor de Signos Vitales",
  "description": "Dispositivo para monitorear presión, pulso y temperatura"
}
```
**Respuesta esperada `201`**

---

### 4.2 — Listar tipos de dispositivo

**Método:** `GET`  
**URL:** `{{base_url}}/device-types`

---

## 📡 FASE 5 — Devices (🔐 requiere token)

> Requiere tener al menos una `location` (paso 3) y un `device-type` (paso 4) creados.

---

### 5.1 — Crear dispositivo

**Método:** `POST`  
**URL:** `{{base_url}}/devices`  
**Body → raw → JSON:**
```json
{
  "name": "Monitor UCI-01",
  "serial_number": "MSV-2024-001",
  "device_type_id": 1,
  "location_id": 2,
  "status": "activo"
}
```
**Respuesta esperada `201`**

---

### 5.2 — Listar dispositivos

**Método:** `GET`  
**URL:** `{{base_url}}/devices`

---

### 5.3 — Obtener dispositivo por ID

**Método:** `GET`  
**URL:** `{{base_url}}/devices/1`

---

### 5.4 — Actualizar dispositivo

**Método:** `PUT`  
**URL:** `{{base_url}}/devices/1`  
**Body → raw → JSON:**
```json
{
  "status": "mantenimiento"
}
```

---

### 5.5 — Eliminar dispositivo

**Método:** `DELETE`  
**URL:** `{{base_url}}/devices/1`

---

## 📊 FASE 6 — Metrics (🔐 requiere token)

> Requiere tener al menos un `device` creado (paso 5).

---

### 6.1 — Registrar métrica

**Método:** `POST`  
**URL:** `{{base_url}}/metrics`  
**Body → raw → JSON:**
```json
{
  "device_id": 1,
  "metric_type": "presion_arterial",
  "value": 120.5,
  "unit": "mmHg"
}
```
**Respuesta esperada `201`**

---

### 6.2 — Listar métricas

**Método:** `GET`  
**URL:** `{{base_url}}/metrics`

---

### 6.3 — Obtener métrica por ID

**Método:** `GET`  
**URL:** `{{base_url}}/metrics/1`

---

## 🚨 FASE 7 — Alerts (🔐 requiere token)

> Requiere tener al menos un `device` creado (paso 5).

---

### 7.1 — Crear severidad de alerta (directo al servicio)

**Método:** `POST`  
**URL:** `http://localhost:5006/alerts/severities`  
**Body → raw → JSON:**
```json
{ "name": "crítica" }
```
```json
{ "name": "advertencia" }
```
```json
{ "name": "informativa" }
```

---

### 7.2 — Crear alerta (vía gateway)

**Método:** `POST`  
**URL:** `{{base_url}}/alerts`  
**Body → raw → JSON:**
```json
{
  "device_id": 1,
  "severity_id": 1,
  "message": "Presión arterial fuera de rango normal: 180 mmHg",
  "status": "activa"
}
```
**Respuesta esperada `201`**

---

### 7.3 — Listar alertas

**Método:** `GET`  
**URL:** `{{base_url}}/alerts`

---

### 7.4 — Resolver una alerta

**Método:** `PUT`  
**URL:** `{{base_url}}/alerts/1`  
**Body → raw → JSON:**
```json
{
  "status": "resuelta"
}
```

---

## 🗺️ Orden recomendado de pruebas

```
1. docker-compose up --build
2. POST :5002/users/roles        → crear rol "admin"
3. POST /auth/register           → crear usuario
4. POST /auth/login              → obtener token ← guardar en Postman
5. POST /device-types            → crear tipo de dispositivo
6. POST /locations               → crear ubicación raíz
7. POST /locations               → crear sub-ubicación (con parent_id)
8. POST /devices                 → crear dispositivo
9. POST /metrics                 → registrar métrica
10. POST :5006/alerts/severities → crear severidades
11. POST /alerts                 → crear alerta
12. PUT  /alerts/1               → resolver alerta
```

---

## 🐛 Errores comunes

| Error | Causa | Solución |
|---|---|---|
| `Connection refused` | Docker no está corriendo | `docker-compose up --build` |
| `401 Token requerido` | No enviaste el header | Añadir `Authorization: Bearer {{token}}` |
| `401 Token expirado` | Pasó más de 1 hora | Repetir el login |
| `404 El rol no existe` | `role_id` inválido | Crear el rol primero (paso 1.1) |
| `502 Bad Gateway` | Un microservicio está caído | `docker-compose logs <servicio>` |
| `500 Internal Server Error` | Error en el microservicio | Revisar logs del servicio específico |

---

## 🛑 Detener el sistema

```bash
# Detener los contenedores
docker-compose down

# Detener Y borrar la base de datos (empezar desde cero)
docker-compose down -v
```
