import express from "express";
import {
  createPolitician,
  getAllPoliticians,
  getPoliticianById,
  updatePolitician,
  deletePolitician
} from "../Controller/politicianController.js";

const router = express.Router();

router.post("/", createPolitician);
router.get("/", getAllPoliticians);
router.get("/:id", getPoliticianById);
router.put("/:id", updatePolitician);
router.delete("/:id", deletePolitician);

export default router;