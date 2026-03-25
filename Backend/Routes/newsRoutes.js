import express from "express";
import {
  getAllNews,
  getPublicNews,
  getPoliticalTrends,
  getArchivedNews,
  verifyNewsForPromise,
  removeLinkedNews,
  updateLinkedNews,
  createNews
} from "../Controller/newsController.js";

import { protect } from "../Middleware/authMiddleware.js";
import { authorizeRoles } from "../Middleware/roleMiddleware.js";

const router = express.Router();

// Public
router.get("/social/trends", getPoliticalTrends);
router.get("/public", getPublicNews);

// 🔐 Admin Only
router.get("/", protect, authorizeRoles("admin"), getAllNews);
router.post("/", protect, authorizeRoles("admin"), createNews);
router.get("/archive/:id", protect, authorizeRoles("admin"), getArchivedNews);
router.post("/verify/:id", protect, authorizeRoles("admin"), verifyNewsForPromise);
router.delete("/link/:id", protect, authorizeRoles("admin"), removeLinkedNews);
router.put("/update/:id", protect, authorizeRoles("admin"), updateLinkedNews);

export default router;
