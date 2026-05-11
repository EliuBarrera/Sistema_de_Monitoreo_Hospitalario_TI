## devices_service completo (listo para correr)
Quedó implementado con el mismo estilo que los otros microservicios.

Endpoints

Device Types (/device-types)
GET /device-types/
GET /device-types/<id>
POST /device-types/ (requiere JWT)
PUT /device-types/<id> (requiere JWT)
DELETE /device-types/<id> (requiere JWT)
Devices (/devices)
GET /devices/ (filtros opcionales: status, device_type_id, serial_number)
GET /devices/<id>
POST /devices/ (requiere JWT)
PUT /devices/<id> (requiere JWT)
DELETE /devices/<id> (requiere JWT)
JWT (compatible con auth_service)

Lee Authorization: Bearer <token>
Verifica firma HS256 con Config.SECRET_KEY
Si falta/expira/inválido responde 401
Cómo ejecutarlo

Corre backend/devices_service/app.py y levanta en puerto 5003
Crea tablas con db.create_all() al iniciar (igual que users_service)