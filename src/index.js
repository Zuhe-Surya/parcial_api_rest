import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import swaggerUI from 'swagger-ui-express';
import { connectDB } from './config/db.js';
import { swaggerSpec } from './config/swagger.js';

import authRoutes from './routes/authRoutes.js';
import personaRoutes from './routes/personaRoutes.js';

dotenv.config();

const publicApiUrl = process.env.RENDER_EXTERNAL_URL
  || process.env.API_BASE_URL
  || `http://localhost:${process.env.PORT || 3000}`;
swaggerSpec.servers = [{
  url: publicApiUrl.replace(/\/+$/, ''),
  description: process.env.RENDER_EXTERNAL_URL ? 'API desplegada en Render' : 'Servidor de API',
}];

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const app = express();
app.use(express.json());

// Archivos estáticos (landing page)
app.use(express.static(path.join(__dirname, '..', 'public')));

// Conexión a Base de Datos
const mongoConnected = await connectDB();
if (!mongoConnected) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('MongoDB es obligatorio en producción. Configura MONGO_URI antes de iniciar la API.');
  }
  console.log('Modo memoria activo: la API puede operar sin MongoDB para pruebas del ejercicio.');
}

// Documentación de Swagger
app.use('/docs', swaggerUI.serve, swaggerUI.setup(swaggerSpec));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ estado: 'ok', mensaje: 'Servidor en linea', timestamp: new Date().toISOString() });
});

// Definición de Rutas
app.use('/api/auth', authRoutes);
app.use('/api/personas', personaRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en: http://localhost:${PORT}`);
  console.log(`Documentación de Swagger disponible en: http://localhost:${PORT}/docs`);
});