import { Router } from 'express';
import {
  getPersonas,
  getPersona,
  createPersona,
  updatePersona,
  deletePersona,
  getFamiliares,
  getParentesco,
  getEstadisticasFamilia,
} from '../controllers/personaController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';

const router = Router();

/**
 * @swagger
 * /api/personas:
 *   get:
 *     tags:
 *       - Personas
 *     summary: Obtiene todas las personas del árbol genealógico
 *     responses:
 *       200:
 *         description: Lista de personas
 *   post:
 *     tags:
 *       - Personas
 *     summary: Crea una nueva persona familiar
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             additionalProperties: false
 *             required:
 *               - nombre
 *               - apellido
 *             properties:
 *               nombre:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 100
 *                 example: Juan
 *               apellido:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 100
 *                 example: Pérez
 *               genero:
 *                 type: string
 *                 enum: [Masculino, Femenino, Otro]
 *                 default: Otro
 *                 example: Masculino
 *               fechaNacimiento:
 *                 type: string
 *                 format: date
 *                 nullable: true
 *                 example: "1990-02-15"
 *               padre:
 *                 type: string
 *                 nullable: true
 *                 pattern: '^[a-fA-F0-9]{24}$'
 *                 description: ID de MongoDB de una persona ya registrada como padre; usa null si no se conoce
 *                 example: null
 *               madre:
 *                 type: string
 *                 nullable: true
 *                 pattern: '^[a-fA-F0-9]{24}$'
 *                 description: ID de MongoDB de una persona ya registrada como madre; usa null si no se conoce
 *                 example: null
 *               observaciones:
 *                 type: string
 *                 maxLength: 1000
 *                 example: Persona de la rama materna
 *             example:
 *               nombre: Juan
 *               apellido: Pérez
 *               genero: Masculino
 *               fechaNacimiento: "1990-02-15"
 *               padre: null
 *               madre: null
 *               observaciones: ""
 *     responses:
 *       201:
 *         description: Persona creada correctamente; devuelve su ID para relacionar familiares
 *       400:
 *         description: Datos inválidos; incluye una lista de errores por campo o relación
 *       401:
 *         description: Falta un token JWT válido
 */
router.get('/', getPersonas);
router.post('/', verifyToken, createPersona);

/**
 * @swagger
 * /api/personas/{id}:
 *   get:
 *     tags:
 *       - Personas
 *     summary: Obtiene una persona por ID
 *   put:
 *     tags:
 *       - Personas
 *     summary: Actualiza una persona
 *     security:
 *       - bearerAuth: []
 *   delete:
 *     tags:
 *       - Personas
 *     summary: Elimina una persona del sistema
 *     security:
 *       - bearerAuth: []
 */
router.get('/:id', getPersona);
router.put('/:id', verifyToken, updatePersona);
router.delete('/:id', verifyToken, deletePersona);

/**
 * @swagger
 * /api/personas/{id}/familiares:
 *   get:
 *     tags:
 *       - Personas
 *     summary: Listado de familiares hasta segundo grado de consanguinidad
 *     parameters:
 *       - in: query
 *         name: maxGrado
 *         schema:
 *           type: integer
 *           default: 2
 *         description: Grado máximo de parentesco a consultar
 *     responses:
 *       200:
 *         description: Lista de familiares
 */
router.get('/:id/familiares', getFamiliares);

/**
 * @swagger
 * /api/personas/{id}/parentesco/{targetId}:
 *   get:
 *     tags:
 *       - Personas
 *     summary: Calcula el parentesco entre dos personas
 *     responses:
 *       200:
 *         description: Resultado del parentesco
 */
router.get('/:id/parentesco/:targetId', getParentesco);

/**
 * @swagger
 * /api/personas/estadisticas:
 *   get:
 *     tags:
 *       - Personas
 *     summary: Muestra estadísticas del árbol genealógico
 *     responses:
 *       200:
 *         description: Estadísticas del árbol
 */
router.get('/estadisticas', getEstadisticasFamilia);

export default router;
