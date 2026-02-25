import express from "express";
import {
  getNewsByPolitician,
  getPoliticalTrends,
  verifyNewsForPromise,
  getArchivedNews,
  removeLinkedNews
} from "../Controller/newsController.js";

const router = express.Router();

// IMPORTANT: specific route first
router.get("/social/trends", getPoliticalTrends);

// Dynamic route after
router.get("/:politicianName", getNewsByPolitician);

router.post("/verify/:id", verifyNewsForPromise);
router.get("/archive/:id", getArchivedNews);
router.delete("/link/:id", removeLinkedNews);

export default router;