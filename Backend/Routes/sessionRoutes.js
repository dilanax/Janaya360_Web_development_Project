import express from "express";
import {
  createSession,
  getAllSessions,
  getSessionById,
  updateSession,
  deleteSession
} from "../Controller/sessionController.js";

const router = express.Router();

router.post("/", createSession);
router.get("/", getAllSessions);
router.get("/:id", getSessionById);
router.put("/:id", updateSession);
router.delete("/:id", deleteSession);

export default router;