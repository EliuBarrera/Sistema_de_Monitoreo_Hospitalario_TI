# Integración Auth → Users Service + Correcciones del Sistema

## Descripción del problema

El sistema tiene una arquitectura de microservicios con los siguientes servicios:

| Servicio | Puerto | Estado |
|---|---|---|
| Gateway | 5000 | Funcional pero incompleto |
| Auth | 5001 | Guarda usuarios en su propia BD, no llama a users_service |
| Users | 5002 | Tiene todo el CRUD, pero nunca recibe datos reales |
| Devices | 5003 | Funcional |
| Locations | 5004 | Funcional |
| Metrics | 5005 | Funcional |
| Alerts | 5006 | Funcional |

El problema central es que el `auth_service` tiene su propio modelo `User` y guarda los usuarios directamente en su propia base de datos, sin notificar al `users_service`. Esto viola el principio de responsabilidad única en microservicios.

## Bugs adicionales detectados

1. **`users_service/routes/user_routes.py`** importa desde `controllers.users_controller` pero el archivo se llama `user_controller.py` → ImportError
2. **`users_service/app.py`** importa `routes.users_routes` pero el archivo se llama `user_routes.py` → ImportError
3. **`users_service/models/`** tiene el modelo en `userModel.py` pero el controller importa desde `models.user_model` → ImportError
4. **`auth_service/routes/auth_routes.py`** devuelve siempre `200` ignorando el status code real del controller (register puede devolver 201, 400, 404)
5. **Gateway `/users`** solo tiene la ruta GET/PUT/DELETE por ID, falta GET ALL y la ruta de roles
6. **Gateway** pasa `request.headers` completo a los microservicios en algunas rutas (devices, metrics), lo que puede causar conflictos con el `Host` header

## Estrategia de integración Auth → Users

Cuando el `auth_service` recibe un `POST /auth/register`, además de crear el usuario en su propia BD (para login/JWT), debe hacer un **HTTP call interno** al `users_service` para registrar el perfil completo del usuario. Esta es la arquitectura correcta para este sistema.

> [!IMPORTANT]
> El `auth_service` mantiene su propio modelo `User` con `password` para autenticación. El `users_service` guarda el perfil del usuario (sin contraseña expuesta). Ambas tablas son en bases de datos separadas (o la misma DB compartida según docker-compose). Si la DB es compartida, se puede omitir la llamada HTTP y hacerlo directamente, pero la solución correcta para microservicios es via HTTP.

## Cambios propuestos

---

### Auth Service

#### [MODIFY] [auth_controller.py](file:///c:/Users/TABORDA/Documents/PROGRAMAS%206/SERVICIOS/ProyectoIntegradorServicio/Sistema_de_Monitoreo_Hospitalario_TI/backend/auth_service/controllers/auth_controller.py)

- Después de crear y guardar el usuario en la BD de auth, hace `requests.post` al `users_service` para registrar el perfil.
- Si el users_service falla, se hace rollback del usuario en auth (consistencia eventual).
- Añadir `USERS_SERVICE_URL` desde variables de entorno.

#### [MODIFY] [auth_routes.py](file:///c:/Users/TABORDA/Documents/PROGRAMAS%206/SERVICIOS/ProyectoIntegradorServicio/Sistema_de_Monitoreo_Hospitalario_TI/backend/auth_service/routes/auth_routes.py)

- Corregir el return para que respete el status code del controller (actualmente hardcodea `200` siempre).

#### [MODIFY] [config.py (auth)](file:///c:/Users/TABORDA/Documents/PROGRAMAS%206/SERVICIOS/ProyectoIntegradorServicio/Sistema_de_Monitoreo_Hospitalario_TI/backend/auth_service/config.py)

- Añadir `USERS_SERVICE_URL` como variable de configuración.

---

### Users Service — Corrección de bugs de importación

#### [MODIFY] [app.py (users)](file:///c:/Users/TABORDA/Documents/PROGRAMAS%206/SERVICIOS/ProyectoIntegradorServicio/Sistema_de_Monitoreo_Hospitalario_TI/backend/users_service/app.py)

- Corregir import: `routes.users_routes` → `routes.user_routes`

#### [MODIFY] [user_routes.py](file:///c:/Users/TABORDA\Documents/PROGRAMAS%206/SERVICIOS/ProyectoIntegradorServicio/Sistema_de_Monitoreo_Hospitalario_TI/backend/users_service/routes/user_routes.py)

- Corregir import: `controllers.users_controller` → `controllers.user_controller`

#### [MODIFY] [user_controller.py](file:///c:/Users/TABORDA/Documents/PROGRAMAS%206/SERVICIOS/ProyectoIntegradorServicio/Sistema_de_Monitoreo_Hospitalario_TI/backend/users_service/controllers/user_controller.py)

- Corregir import: `models.user_model` → `models.userModel` (o renombrar el archivo a `user_model.py`)
- Añadir endpoint interno `create_user_internal` que acepta datos sin password (llamado desde auth).

#### [RENAME] userModel.py → user_model.py

- Renombrar para seguir convención snake_case consistente con el resto del proyecto.

---

### Gateway — Completar rutas faltantes

#### [MODIFY] [app.py (gateway)](file:///c:/Users/TABORDA/Documents/PROGRAMAS%206/SERVICIOS/ProyectoIntegradorServicio/Sistema_de_Monitoreo_Hospitalario_TI/backend/gateway/app.py)

- Añadir `GET /users` (listar todos los usuarios) y `POST /users` (crear usuario manualmente)
- Añadir `GET /users/roles` y `POST /users/roles` (gestión de roles)
- Añadir `alerts` service al `SERVICE_URLS` (puerto 5006) y sus rutas proxy
- Limpiar el paso de headers (no reenviar headers del cliente directamente)

---

### [NEW] docker-compose.yml

Crear `docker-compose.yml` en la raíz del proyecto para orquestar todos los servicios con su propia BD PostgreSQL.

---

### [NEW] Archivos `.env` por servicio

Añadir archivos `.env.example` con las variables necesarias para cada servicio.

## Plan de verificación

1. Arrancar todos los servicios con Docker Compose
2. `POST /auth/register` → debe crear usuario en auth y notificar a users_service
3. `POST /auth/login` → debe retornar JWT válido
4. `GET /users` (con token) → debe listar usuarios sincronizados
5. Verificar que errores del microservicio retornan el status code correcto

## Preguntas abiertas

> [!IMPORTANT]
> **¿Comparten base de datos?** ¿El `auth_service` y `users_service` usan la misma base de datos PostgreSQL o tienen bases de datos separadas? Esto afecta si la llamada HTTP entre servicios es estrictamente necesaria o si ambos pueden leer la misma tabla `users`.

> [!NOTE]
> **Manejo de consistencia**: Si el users_service no está disponible durante el registro, ¿el registro en auth debe fallar completamente (consistencia fuerte) o puede continuar y reintentar después (consistencia eventual)? Por ahora el plan asume **consistencia fuerte** (rollback si falla).
