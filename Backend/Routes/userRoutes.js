import express from "express";
import {
  registerUser,
  loginUser,
  getUsers,
  deleteUser,
  searchUserByEmail,
  sendOTP,
  verifyOTP,
  updateUser,
} from "../Controller/userController.js";

import { protect } from "../Middleware/authMiddleware.js";
import { authorizeRoles } from "../Middleware/roleMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/send-otp", sendOTP);
router.post("/verify-otp", verifyOTP);
router.get("/", protect, authorizeRoles("admin"), getUsers);
router.put("/:id", protect, authorizeRoles("admin"), updateUser);
router.get("/search/email", protect, authorizeRoles("admin"), searchUserByEmail);
router.delete("/:id", protect, authorizeRoles("admin"), deleteUser);

export default router;
