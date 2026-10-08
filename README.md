# Parcial API REST

API REST construida con Node.js, Express y MongoDB (Mongoose). Incluye autenticación JWT, gestión de categorías y productos, y documentación interactiva con Swagger.

## Requisitos

- Node.js 20 o superior
- npm
- MongoDB local o una URI de MongoDB Atlas

## Configuración local

1. Instala las dependencias:

   ```bash
   npm ci
   ```

2. Copia `.env.example` como `.env` y configura `MONGO_URI` y `JWT_SECRET`.

   En PowerShell:

   ```powershell
   Copy-Item .env.example .env
   ```

3. Inicia el servidor:

   ```bash
   npm run dev
   ```

La API queda disponible en `http://localhost:3000`, la documentación Swagger en `http://localhost:3000/docs` y el estado del servidor en `http://localhost:3000/api/health`.

## Variables de entorno

| Variable | Descripción |
| --- | --- |
| `PORT` | Puerto HTTP del servidor (por defecto, `3000`) |
| `MONGO_URI` | Cadena de conexión de MongoDB |
| `JWT_SECRET` | Secreto privado utilizado para firmar tokens JWT |

No publiques tu archivo `.env` ni agregues secretos al repositorio. Configura estas variables como secrets del entorno de despliegue cuando sea necesario.

## Scripts

- `npm run dev`: inicia el servidor con Nodemon.
- `npm start`: inicia el servidor.
- `npm run check`: valida la sintaxis del punto de entrada.

## Endpoints principales

- `/api/auth`: registro e inicio de sesión.
- `/api/categorias`: operaciones de categorías.
- `/api/productos`: operaciones de productos.
- `/api/health`: comprobación de estado.

Consulta Swagger para ver los métodos, parámetros y esquemas disponibles.
