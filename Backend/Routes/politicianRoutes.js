import express from 'express';
import { 
  getPoliticians, 
  getPoliticianById, 
  createPolitician, 
  updatePolitician, 
  deletePolitician 
} from '../Controller/politicianController.js';
import { protect } from '../Middleware/authMiddleware.js';
import { authorizeRoles } from '../Middleware/roleMiddleware.js';

const router = express.Router();

/**
 * @openapi
 * /api/politicians:
 *   get:
 *     summary: Get all politicians
 *     tags:
 *       - Politicians
 *   post:
 *     summary: Create a new politician profile (Admin only)
 *     tags:
 *       - Politicians
 *     security:
 *       - bearerAuth: []
 */
router.route('/')
  .get(getPoliticians)
  .post(protect, authorizeRoles('admin'), createPolitician);

/**
 * @openapi
 * /api/politicians/{id}:
 *   get:
 *     summary: Get a specific politician
 *     tags:
 *       - Politicians
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *   put:
 *     summary: Update politician details (Admin only)
 *     tags:
 *       - Politicians
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *   delete:
 *     summary: Remove a politician (Admin only)
 *     tags:
 *       - Politicians
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */
router.route('/:id')
  .get(getPoliticianById)
  .put(protect, authorizeRoles('admin'), updatePolitician)
  .delete(protect, authorizeRoles('admin'), deletePolitician);

export default router;