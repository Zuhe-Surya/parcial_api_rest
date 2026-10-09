# Parcial API REST

API REST construida con Node.js, Express y MongoDB (Mongoose). Incluye autenticación JWT y el módulo de árbol genealógico para registrar personas y consultar parentescos hasta segundo grado de consanguinidad.

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
| `API_BASE_URL` | URL pública opcional para Swagger; en Render se usa automáticamente `RENDER_EXTERNAL_URL` |

No publiques tu archivo `.env` ni agregues secretos al repositorio. Configura estas variables como secrets del entorno de despliegue cuando sea necesario.
En Render configura `MONGO_URI` y `JWT_SECRET` en **Environment**. Swagger utilizará la URL pública del servicio para que sus solicitudes no apunten a `localhost`.

### Despliegue en Render

1. Sube el proyecto a GitHub y en Render crea un **Blueprint** seleccionando este repositorio. Render leerá `render.yaml` y configurará el servicio web.
2. En el formulario de configuración del Blueprint, proporciona `MONGO_URI` como variable secreta. El Blueprint genera `JWT_SECRET` y establece `NODE_ENV=production`.
3. Comprueba que el acceso de red de MongoDB Atlas permita conexiones salientes desde Render y que el usuario de base de datos tenga permisos sobre la base utilizada.
4. Cuando el servicio esté desplegado, valida `https://<nombre-del-servicio>.onrender.com/api/health` y abre `/docs`. Swagger usará automáticamente la URL pública de Render.

La API no inicia en producción si no consigue conectar a MongoDB, para evitar aceptar inserciones en memoria que se perderían al reiniciar el servicio.

## Módulo de árbol genealógico

La API incluye el recurso `/api/personas` para:

- Registrar personas con nombre, apellido, género, fecha de nacimiento, padre, madre y observaciones.
- Listar todo el árbol familiar.
- Consultar una persona por ID.
- Actualizar y eliminar registros.
- Obtener familiares hasta segundo grado de consanguinidad.
- Calcular el parentesco entre dos personas.
- Revisar estadísticas del árbol familiar.

### Ejemplo de uso

1. Registrar usuario autenticado:

   ```bash
   POST /api/auth/register
   ```

2. Iniciar sesión:

   ```bash
   POST /api/auth/login
   ```

3. Crear una persona:

   ```bash
   POST /api/personas
   Authorization: Bearer <token>
   ```

   ```json
   {
     "nombre": "Ana",
     "apellido": "García",
     "genero": "Femenino",
     "fechaNacimiento": "1990-02-15",
     "padre": null,
     "madre": null,
     "observaciones": "Primera persona del árbol"
   }
   ```

   `nombre` y `apellido` son obligatorios. La fecha debe ser válida en formato `YYYY-MM-DD`; el género acepta `Masculino`, `Femenino` u `Otro`. Para asociar padres, créalos primero y usa sus IDs devueltos en la respuesta. Las referencias deben ser IDs válidos de personas existentes y padre y madre no pueden ser la misma persona. Swagger muestra los errores de validación con estado `400`.

4. Consultar familiares hasta segundo grado:

   ```bash
   GET /api/personas/<id>/familiares?maxGrado=2
   ```

5. Consultar parentesco:

   ```bash
   GET /api/personas/<id>/parentesco/<id_objetivo>
   ```

## Scripts

- `npm run dev`: inicia el servidor con Nodemon.
- `npm start`: inicia el servidor.
- `npm run check`: valida la sintaxis del punto de entrada.

## Endpoints principales

- `/api/auth`: registro e inicio de sesión.
- `/api/personas`: gestión del árbol familiar.
- `/api/health`: comprobación de estado.

Consulta Swagger para ver los métodos, parámetros y esquemas disponibles.
