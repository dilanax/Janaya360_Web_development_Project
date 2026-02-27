import express from 'express';
import promiseController from '../Controller/promisesController.js';

// Import your authentication and authorization middlewares
import { protect } from '../Middleware/authMiddleware.js';
import { authorizeRoles } from '../Middleware/roleMiddleware.js';

const router = express.Router();

// ==============================
// PUBLIC ROUTES (Citizens)
// ==============================
router.get('/', promiseController.getAllPromises);
router.get('/stats/:politicianId', promiseController.getStatsByPolitician);
router.get('/:id', promiseController.getPromiseById);

// ==============================
// PROTECTED ROUTES (Admin/Auditor)
// ==============================
router.post('/', protect, authorizeRoles('admin'), promiseController.createPromise);
router.put('/:id', protect, authorizeRoles('admin'), promiseController.updatePromise);
router.delete('/:id', protect, authorizeRoles('admin'), promiseController.deletePromise);
router.patch('/:id/status', protect, authorizeRoles('admin', 'auditor'), promiseController.updateStatus);
router.get('/:id/search-evidence', protect, authorizeRoles('admin', 'auditor'), promiseController.searchEvidence);

export default router;