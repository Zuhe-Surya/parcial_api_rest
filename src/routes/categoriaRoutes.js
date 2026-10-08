import { Router } from 'express';
import { getCategorias, createCategoria } from '../controllers/categoriaController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';

const router = Router();

/**
 * @swagger
 * /api/categorias:
 *   get:
 *     tags:
 *       - Categorías
 *     summary: Obtener todas las categorías
 *     responses:
 *       200:
 *         description: Lista devuelta correctamente
 *   post:
 *     tags:
 *       - Categorías
 *     summary: Crear categoría (Ruta Protegida por JWT)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: Electrónicos
 *               descripcion:
 *                 type: string
 *                 example: Productos electrónicos y gadgets
 *     responses:
 *       201:
 *         description: Categoría creada
 *       400:
 *         description: Campos inválidos o faltantes
 *       401:
 *         description: Token no proporcionado
 *       403:
 *         description: Token inválido o expirado
 *       409:
 *         description: Ya existe una categoría con ese nombre
 */
router.get('/', getCategorias);
router.post('/', verifyToken, createCategoria);

export default router;