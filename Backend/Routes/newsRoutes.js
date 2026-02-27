import express from "express";
import {
  getPoliticalTrends,
  getArchivedNews,
  verifyNewsForPromise,
  removeLinkedNews,
  updateLinkedNews
} from "../Controller/newsController.js";

import { protect } from "../Middleware/authMiddleware.js";
import { authorizeRoles } from "../Middleware/roleMiddleware.js";

const router = express.Router();

// Public
router.get("/social/trends", getPoliticalTrends);

// 🔐 Admin Only
router.get("/archive/:id", protect, authorizeRoles("admin"), getArchivedNews);
router.post("/verify/:id", protect, authorizeRoles("admin"), verifyNewsForPromise);
router.delete("/link/:id", protect, authorizeRoles("admin"), removeLinkedNews);
router.put("/update/:id", protect, authorizeRoles("admin"), updateLinkedNews);

export default router;