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
// --- BACKEND CODE (Express/Node.js) ---
// Route: GET /api/promises/:id/search-evidence

// Add this to your promiseRoutes.js file!
router.get('/:id/search-evidence', async (req, res) => {
  try {
    // 1. Find the promise
    const promise = await Promise.findById(req.params.id).populate('politicianId');
    if (!promise) return res.status(404).json({ message: 'Promise not found' });

    // 2. Mock News Data (So we can test the UI immediately)
    const mockEvidence = [
      {
        title: `BREAKING: Updates on ${promise.title}`,
        source: 'Sri Lanka Daily News',
        url: 'https://dailynews.lk',
        publishedAt: new Date().toISOString()
      },
      {
        title: `${promise.politicianId.name} addresses public regarding recent commitments`,
        source: 'Newswire SL',
        url: 'https://newswire.lk',
        publishedAt: new Date(Date.now() - 86400000).toISOString() 
      }
    ];

    // 3. Send it back
    res.json({ data: mockEvidence });

  } catch (error) {
    console.error("News Search Error:", error);
    res.status(500).json({ message: 'Failed to search news evidence' });
  }
});
export default router;