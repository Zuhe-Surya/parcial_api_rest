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
 *   parameters:
 *     - in: path
 *       name: id
 *       required: true
 *       description: ID de la persona devuelto al crearla o consultarla
 *       schema:
 *         type: string
 *       example: 507f1f77bcf86cd799439011
 *   get:
 *     tags:
 *       - Personas
 *     summary: Obtiene una persona por ID
 *     responses:
 *       200:
 *         description: Persona encontrada
 *       404:
 *         description: No existe una persona con ese ID
 *       500:
 *         description: Error al consultar la persona
 *   put:
 *     tags:
 *       - Personas
 *     summary: Actualiza los datos de una persona por ID
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             additionalProperties: false
 *             minProperties: 1
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: Juan
 *               apellido:
 *                 type: string
 *                 example: Pérez
 *               genero:
 *                 type: string
 *                 enum: [Masculino, Femenino, Otro]
 *                 example: Masculino
 *               fechaNacimiento:
 *                 type: string
 *                 format: date
 *                 nullable: true
 *                 example: "1990-02-15"
 *               padre:
 *                 type: string
 *                 nullable: true
 *                 description: ID de una persona existente o null
 *                 example: null
 *               madre:
 *                 type: string
 *                 nullable: true
 *                 description: ID de una persona existente o null
 *                 example: null
 *               observaciones:
 *                 type: string
 *                 example: Datos actualizados
 *     responses:
 *       200:
 *         description: Persona actualizada
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: Falta un token JWT válido
 *       404:
 *         description: No existe una persona con ese ID
 *       500:
 *         description: Error al actualizar la persona
 *   delete:
 *     tags:
 *       - Personas
 *     summary: Elimina una persona por ID
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Persona eliminada correctamente
 *       401:
 *         description: Falta un token JWT válido
 *       404:
 *         description: No existe una persona con ese ID
 *       400:
 *         description: No se pudo eliminar la persona
 */
/**
 * @swagger
 * /api/personas/estadisticas:
 *   get:
 *     tags:
 *       - Personas
 *     summary: Muestra estadísticas del árbol genealógico
 *     responses:
 *       200:
 *         description: Estadísticas del árbol familiar
 *       500:
 *         description: Error al calcular las estadísticas
 */
router.get('/estadisticas', getEstadisticasFamilia);
router.get('/:id', getPersona);
router.put('/:id', verifyToken, updatePersona);
router.delete('/:id', verifyToken, deletePersona);

/**
 * @swagger
 * /api/personas/{id}/familiares:
 *   parameters:
 *     - in: path
 *       name: id
 *       required: true
 *       description: ID de la persona cuyos familiares se consultan
 *       schema:
 *         type: string
 *       example: 507f1f77bcf86cd799439011
 *   get:
 *     tags:
 *       - Personas
 *     summary: Listado de familiares hasta segundo grado de consanguinidad
 *     parameters:
 *       - in: query
 *         name: maxGrado
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 2
 *           default: 2
 *         description: Grado máximo de parentesco a consultar
 *     responses:
 *       200:
 *         description: Lista de familiares
 *       404:
 *         description: No existe una persona con ese ID
 */
router.get('/:id/familiares', getFamiliares);

/**
 * @swagger
 * /api/personas/{id}/parentesco/{targetId}:
 *   parameters:
 *     - in: path
 *       name: id
 *       required: true
 *       description: ID de la primera persona
 *       schema:
 *         type: string
 *       example: 507f1f77bcf86cd799439011
 *     - in: path
 *       name: targetId
 *       required: true
 *       description: ID de la segunda persona
 *       schema:
 *         type: string
 *       example: 507f1f77bcf86cd799439012
 *   get:
 *     tags:
 *       - Personas
 *     summary: Calcula el parentesco entre dos personas
 *     responses:
 *       200:
 *         description: Resultado del parentesco
 *       404:
 *         description: Una de las personas no existe
 */
router.get('/:id/parentesco/:targetId', getParentesco);

export default router;
