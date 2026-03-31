import express from 'express';
import promiseController from '../Controller/promisesController.js';

// Import your authentication and authorization middlewares
import { protect } from '../Middleware/authMiddleware.js';
import { authorizeRoles } from '../Middleware/roleMiddleware.js';

const router = express.Router();

// ==========================================
// PUBLIC ROUTES (Citizens & Guest Users)
// ==========================================

// 1. Get all promises (Feed)
router.get('/', promiseController.getAllPromises);

// 2. Get stats for a specific politician (Charts)
router.get('/stats/:politicianId', promiseController.getStatsByPolitician);

// 3. Get deep-dive details for a single promise
router.get('/:id', promiseController.getPromiseById);

// 4. NEW: Public Community Voting (Truthful / False)
// No 'protect' middleware here so guests can vote!
router.post('/:id/vote', promiseController.votePromise);


// ==========================================
// PROTECTED ROUTES (Admin / Auditor Only)
// ==========================================

// 5. Create a new political commitment
router.post('/', protect, authorizeRoles('admin'), promiseController.createPromise);

// 6. Main Update route (Now handles the Status History Ledger automatically!)
router.put('/:id', protect, authorizeRoles('admin'), promiseController.updatePromise);

// 7. Delete a record permanently
router.delete('/:id', protect, authorizeRoles('admin'), promiseController.deletePromise);

// 8. Specialized status update (For auditors)
router.patch('/:id/status', protect, authorizeRoles('admin', 'auditor'), promiseController.updateStatus);

// 9. NEW: Real News Evidence Search (Moved into the Controller)
router.get('/:id/search-evidence', protect, authorizeRoles('admin', 'auditor'), promiseController.searchEvidence);

// 10. NEW: AI Sentiment Analysis (Hugging Face Integration)
// This is used by the Admin panel to "Analyze Truth" of a news headline
router.post('/analyze-evidence', protect, authorizeRoles('admin', 'auditor'), async (req, res) => {
    // We keep this specific logic in the route or move to controller if preferred
    // For now, let's assume it's handled via a dedicated controller method 
    // or just leave the placeholder if you've added it to the Controller class.
    // If you added it to the controller, use: promiseController.analyzeSentiment;
});

export default router;