import express from "express";
import {
  registerUser,
  loginUser,
  getUsers,
  deleteUser,
  searchUserByEmail,
} from "../Controller/userController.js";

import { protect } from "../Middleware/authMiddleware.js";
import { authorizeRoles } from "../Middleware/roleMiddleware.js";

const router = express.Router();

/**
 * @openapi
 * /api/users/register:
 *   post:
 *     summary: Register a new user
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterUser'
 *     responses:
 *       201:
 *         description: Created
 *
 * /api/users/login:
 *   post:
 *     summary: Login user
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginUser'
 *     responses:
 *       200:
 *         description: OK
 *
 * /api/users:
 *   get:
 *     summary: Get users (admin)
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: OK
 *       401:
 *         description: Unauthorized - requires valid JWT token
 *       403:
 *         description: Forbidden - admin role required
 *
 * /api/users/search/email:
 *   get:
 *     summary: Search user by email (admin)
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *           format: email
 *         description: Email to search
 *     responses:
 *       200:
 *         description: OK
 *       401:
 *         description: Unauthorized - requires valid JWT token
 *       403:
 *         description: Forbidden - admin role required
 *
 * /api/users/{id}:
 *   delete:
 *     summary: Delete user (admin)
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Deleted
 *       401:
 *         description: Unauthorized - requires valid JWT token
 *       403:
 *         description: Forbidden - admin role required
 */

router.post("/register", registerUser);
router.post("/login", loginUser);

router.get("/", protect, authorizeRoles("admin"), getUsers);
router.get("/search/email", protect, authorizeRoles("admin"), searchUserByEmail);

router.delete("/:id", protect, authorizeRoles("admin"), deleteUser);

export default router;
