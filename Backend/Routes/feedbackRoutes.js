import express from "express";
import {
  createFeedback,
  getFeedbackByPromise,
  voteFeedback,
  updateFeedback,
  deleteFeedback,
} from "../Controller/feedbackController.js";
import { protect } from "../Middleware/authMiddleware.js";

const router = express.Router();

// ✅ Create feedback for a specific promise
router.post("/:promiseId", protect, createFeedback);

// ✅ Get all feedback for a specific promise
router.get("/:promiseId", getFeedbackByPromise);

// ✅ Vote on a feedback (use feedbackId, not promiseId)
router.post("/:feedbackId/vote", protect, voteFeedback);

// ✅ Update feedback by feedbackId
router.patch("/:id", protect, updateFeedback);

// ✅ Delete feedback by feedbackId
router.delete("/:id", protect, deleteFeedback);

export default router;