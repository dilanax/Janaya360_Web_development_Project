import express from 'express';
import { body, validationResult } from 'express-validator';
import { getPromises, createPromise, updateStatus, searchEvidence, deletePromise, getPromiseStats, getRecentUpdates ,factCheckPromise} from '../Controller/promiseController.js';
import { protect } from '../Middleware/authMiddleware.js';
import { authorizeRoles } from '../Middleware/roleMiddleware.js';

const router = express.Router();

const validatePromise = [
  body('title').notEmpty().withMessage('Promise title is required'),
  body('description').isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
  body('category').optional().isIn(['Economy', 'Education', 'Health', 'Infrastructure']).withMessage('Invalid category'),
  // Ensure either politicianId or politician object is provided
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { politicianId, politician } = req.body;
    if (!politicianId && !politician) {
      return res.status(400).json({ message: 'Either politicianId or politician object must be provided' });
    }

    if (politician && typeof politician === 'object') {
      if (!politician.name || !politician.party || !politician.district) {
        return res.status(400).json({ message: 'politician object must include name, party and district' });
      }
    }

    next();
  }
];

/**
 * @openapi
 * /api/promises/feed/recent:
 *   get:
 *     summary: Get the 5 most recently updated promises
 *     tags:
 *       - Promises
 */
router.get('/feed/recent', getRecentUpdates);

/**
 * @openapi
 * /api/promises/stats/{politicianId}:
 *   get:
 *     summary: Get promise completion statistics for a politician
 *     tags:
 *       - Promises
 *     parameters:
 *       - in: path
 *         name: politicianId
 *         required: true
 *         schema:
 *           type: string
 */
router.get('/stats/:politicianId', getPromiseStats);

/**
 * @openapi
 * /api/promises:
 *   get:
 *     summary: Get all politician promises
 *     tags:
 *       - Promises
 *   post:
 *     summary: Log a new promise (Admin only)
 *     tags:
 *       - Promises
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *               politicianId:
 *                 type: string
 *     responses:
 *       '201':
 *         description: Promise created
 *       '400':
 *         description: Validation error
 */
router.post('/', protect, authorizeRoles('admin'), validatePromise, createPromise);

/**
 * @openapi
 * /api/promises/{id}/status:
 *   patch:
 *     summary: Update promise status based on evidence
 *     tags:
 *       - Promises
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *               evidenceUrl:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Status updated
 *       '400':
 *         description: Bad request
 */
router.patch('/:id/status', protect, authorizeRoles('admin', 'auditor'), updateStatus);

/**
 * @openapi
 * /api/promises/{id}:
 *   delete:
 *     summary: Delete a promise (Admin only)
 *     tags:
 *       - Promises
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Promise successfully deleted
 *       '404':
 *         description: Promise not found
 */
router.delete('/:id', protect, authorizeRoles('admin'), deletePromise);

/**
 * @openapi
 * /api/promises/{id}/search-evidence:
 *   get:
 *     summary: Auto-search news for evidence
 *     tags:
 *       - Promises
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Search results returned
 */
router.get('/:id/search-evidence', searchEvidence);

/**
 * @openapi
 * /api/promises/{id}/fact-check:
 *   get:
 *     summary: Check claims using Google Fact Check API
 *     tags:
 *       - Promises
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Fact checks returned
 */
router.get('/:id/fact-check', factCheckPromise);

export default router;