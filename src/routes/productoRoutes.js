import { Router } from 'express';
import { getProductos, createProducto } from '../controllers/productoController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';

const router = Router();

/**
 * @swagger
 * /api/productos:
 *   get:
 *     tags:
 *       - Productos
 *     summary: Obtener todos los productos con su categoría
 *     responses:
 *       200:
 *         description: Lista devuelta correctamente
 *   post:
 *     tags:
 *       - Productos
 *     summary: Crear producto (Ruta Protegida por JWT)
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
 *               - precio
 *               - categoria
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: Laptop Gaming
 *               precio:
 *                 type: number
 *                 example: 1500000
 *               categoria:
 *                 type: string
 *                 description: ID de la categoría asociada (ObjectId de MongoDB)
 *                 example: 664f1a2b3c4d5e6f7a8b9c0d
 *     responses:
 *       201:
 *         description: Producto creado
 *       400:
 *         description: Campos inválidos, faltantes o ID de categoría no válido
 *       401:
 *         description: Token no proporcionado
 *       403:
 *         description: Token inválido o expirado
 */
router.get('/', getProductos);
router.post('/', verifyToken, createProducto);

export default router;