# Frontend - Sistema de Monitoreo Hospitalario

Frontend desarrollado con React, TypeScript, Vite y ShadCN UI para el sistema de monitoreo hospitalario.  
Porque claramente dormir tranquilo no era suficiente y ahora necesitamos dashboards en tiempo real para todo.

---

# Tecnologías utilizadas

- React
- TypeScript
- Vite
- Bun
- TailwindCSS v4
- ShadCN UI
- Axios
- React Router DOM

---

# Requisitos previos

Antes de ejecutar el proyecto asegúrese de tener instalado:

- Node.js >= 20
- Bun
- Git

---

# Instalación

## 1. Clonar el repositorio

```bash
git clone https://github.com/EliuBarrera/Sistema_de_Monitoreo_Hospitalario_TI.git
```

---

## 2. Ingresar a la carpeta del frontend

```bash
cd REPOSITORIO/frontend
```

---

## 3. Instalar dependencias

Con Bun:

```bash
bun install
```

O con npm:

```bash
npm install
```

La humanidad creó 14 gestores de paquetes para resolver el problema de tener 1 gestor de paquetes.

---

# Variables de entorno

Crear un archivo `.env` en la raíz del frontend:

```env
VITE_API_URL=http://localhost:5000
```

Reemplace la URL según la dirección donde esté ejecutándose el API Gateway.

---

# Ejecutar el proyecto

Con Bun:

```bash
bun run dev
```

Con npm:

```bash
npm run dev
```

---

# Acceder al aplicativo

Abrir en el navegador:

```txt
http://localhost:5173
```

Si el puerto está ocupado Vite utilizará otro automáticamente.

Porque hasta los puertos tienen problemas de convivencia.

---

# Estructura del proyecto

```txt
src/
│
├── api/              # Servicios HTTP
├── components/       # Componentes reutilizables
├── hooks/            # Custom hooks
├── layouts/          # Layouts generales
├── pages/            # Páginas principales
├── routes/           # Configuración de rutas
├── services/         # Servicios adicionales
├── types/            # Interfaces y tipados
└── utils/            # Utilidades
```

---

# Funcionalidades actuales

- Inicio de sesión
- Registro de usuarios
- Manejo de JWT
- Dashboard administrativo
- Consumo de microservicios mediante API Gateway
- Protección de rutas
- Componentes modernos con ShadCN UI

---

# Solución de errores comunes

## Error: Cannot find module '@/...'

Verifique que exista esta configuración en `tsconfig.json`:

```json
"baseUrl": ".",
"paths": {
  "@/*": ["src/*"]
}
```

---

## Error con componentes ShadCN

Reinstalar componentes:

```bash
bunx --bun shadcn@latest add button input card label checkbox
```

---

## Error de CORS

Asegúrese de que el API Gateway tenga habilitado CORS:

```python
from flask_cors import CORS

CORS(app)
```

---

# Scripts disponibles

```bash
bun run dev       # Ejecuta entorno de desarrollo
bun run build     # Genera build de producción
bun run preview   # Vista previa del build
```

---

# Autor

Proyecto desarrollado para la asignatura de Desarrollo Orientado a Servicios.

Porque evidentemente hacer un CRUD simple ya no era suficiente sufrimiento académico.