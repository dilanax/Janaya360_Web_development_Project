import express from "express";
import {
  getNewsByPolitician,
  getPoliticalTrends,
  verifyNewsForPromise,
  getArchivedNews,
  removeLinkedNews,
} from "../Controller/newsController.js";

const router = express.Router();

// Specific routes FIRST
router.get("/social/trends", getPoliticalTrends);
router.get("/archive/:id", getArchivedNews);
router.post("/verify/:id", verifyNewsForPromise);
router.delete("/link/:id", removeLinkedNews);

// Dynamic route LAST
router.get("/:politicianName", getNewsByPolitician);

export default router;