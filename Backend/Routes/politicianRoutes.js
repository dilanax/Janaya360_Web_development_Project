import express from "express";
import {
  createPolitician,
  getAllPoliticians,
  getPoliticianById,
  updatePolitician,
  deletePolitician
} from "../Controller/politicianController.js";

import { protect } from "../Middleware/authMiddleware.js";
import { authorizeRoles } from "../Middleware/roleMiddleware.js";

const router = express.Router();

/* PUBLIC */
router.get("/", getAllPoliticians);
router.get("/:id", getPoliticianById);

/* ADMIN ONLY ..*/
router.post("/", protect, authorizeRoles("admin"), createPolitician);
router.put("/:id", protect, authorizeRoles("admin"), updatePolitician);
router.delete("/:id", protect, authorizeRoles("admin"), deletePolitician);

export default router;