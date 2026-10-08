import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import swaggerUI from 'swagger-ui-express';
import { connectDB } from './config/db.js';
import { swaggerSpec } from './config/swagger.js';

import authRoutes from './routes/authRoutes.js';
import categoriaRoutes from './routes/categoriaRoutes.js';
import productoRoutes from './routes/productoRoutes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const app = express();
app.use(express.json());

// Archivos estáticos (landing page)
app.use(express.static(path.join(__dirname, '..', 'public')));

// Conexión a Base de Datos
connectDB();

// Documentación de Swagger
app.use('/docs', swaggerUI.serve, swaggerUI.setup(swaggerSpec));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ estado: 'ok', mensaje: 'Servidor en linea', timestamp: new Date().toISOString() });
});

// Definición de Rutas
app.use('/api/auth', authRoutes);
app.use('/api/categorias', categoriaRoutes);
app.use('/api/productos', productoRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en: http://localhost:${PORT}`);
  console.log(`Documentación de Swagger disponible en: http://localhost:${PORT}/docs`);
});