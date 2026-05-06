# Cuando clonas un repositorio, Git descarga todo el historial, pero normalmente solo te muestra la rama principal (main o master) de forma activa. Para traer las demás y unirlas a tu código local, sigue estos pasos:
#
## 1. Actualizar las referencias remotas
Primero, asegúrate de que tu Git local sepa exactamente qué ramas existen en GitHub ahora mismo:
#
git fetch --all
#
## 2. Ver todas las ramas disponibles
Para ver tanto tus ramas locales como las que están en el servidor (remotas), usa:
#
git branch -a
#
## 3. Traer una rama remota a tu local
Si quieres traer la rama de un servicio específico (por ejemplo, servicio-auth) para ver su código:
#
git checkout user-service
#
## Conectar cuando hacemos la descarga del archivo zip
git remote add origin https://github.com/EliuBarrera/Sistema_de_Monitoreo_Hospitalario_TI.git
#
## Verificamos conexión
#
git remote -v
#
## Ahora sí
#
git fetch origin
git checkout user-service
#
## Si tu intención es empezar a trabajar sobre lo que hizo tu compañero en user-service, usa la Opción 1 (git checkout -f user-service). Esto alineará tu carpeta local
#
## 1. Crear y saltar a tu nueva rama
Primero, vamos a crear la rama n1kko y movernos a ella.
git checkout -b n1kko
#
## 2. Preparar los archivos (Staging)
Añadimos todos los archivos de tu nuevo servicio al área de preparación:
git add .
#
## 3. Hacer el Commit con tu descripción detallada
En Git, la "descripción" se pone en el mensaje del commit. Dado que tu explicación es detallada, lo mejor es usar el siguiente comando (puedes copiar y pegar todo el bloque): 
#
git commit -m "feat: implementar devices_service completo" -m "Detalles del cambio:
- Implementación de endpoints para Device Types y Devices.
- Soporte para filtros en GET /devices/ (status, type, serial).
- Integración de seguridad JWT compatible con auth_service (HS256).
- Configuración de base de datos automática con db.create_all().
- Ejecución en puerto 5005."
#
## 4. Subir la rama a GitHub
Como es la primera vez que subes esta rama, debes decirle a Git que la cree también en el servidor:
git push origin n1kko