import express from "express";
import {
  createNotification,
  sendNotification,
  getMyNotifications,
  getNotificationsByType,
  getNotificationsByStatus,
  createPromotionalNotification,
  createNotificationForUser,
  updateNotification,
  updateNotificationStatus,
  markAsExpired,
  autoExpireNotifications,
  markAsDeleted,
  markAsRead,
  filterNotifications,
  getNotificationStats,
  viewNotifications,
  deleteNotification,
  getOTPActivityLogs,
  getEmailActivityLogs,
  getOTPLogsForEmail,
  getEmailLogsForAddress,
  getEmailStats
} from "../Controller/notificationController.js";

import { protect } from "../Middleware/authMiddleware.js";
import { authorizeRoles } from "../Middleware/roleMiddleware.js";

const router = express.Router();
router.get("/", protect, authorizeRoles("admin"), viewNotifications);
router.get("/my", protect, getMyNotifications);
router.get("/stats", protect, getNotificationStats);
router.get("/filter", protect, filterNotifications);
router.get("/type/:type", protect, getNotificationsByType);
router.patch("/read/:notificationId", protect, markAsRead);
router.patch("/read", protect, markAsRead);
router.post("/", protect, authorizeRoles("admin"), createNotification);
router.post("/send", protect, authorizeRoles("admin"), sendNotification);
router.post("/promotional", protect, authorizeRoles("admin"), createPromotionalNotification);
router.post("/for-user", protect, authorizeRoles("admin"), createNotificationForUser);
router.put("/:id", protect, authorizeRoles("admin"), updateNotification);
router.patch("/:id/status", protect, authorizeRoles("admin"), updateNotificationStatus);
router.get("/status/:status", protect, authorizeRoles("admin"), getNotificationsByStatus);
router.patch("/:id/expire", protect, authorizeRoles("admin"), markAsExpired);
router.patch("/:id/delete", protect, authorizeRoles("admin"), markAsDeleted);
router.post("/auto-expire", protect, authorizeRoles("admin"), autoExpireNotifications);
router.delete("/:id", protect, authorizeRoles("admin"), deleteNotification);
router.get("/logs/otp/all", protect, authorizeRoles("admin"), getOTPActivityLogs);
router.get("/logs/email/all", protect, authorizeRoles("admin"), getEmailActivityLogs);
router.get("/logs/otp/:email", protect, authorizeRoles("admin"), getOTPLogsForEmail);
router.get("/logs/email/:email", protect, authorizeRoles("admin"), getEmailLogsForAddress);
router.get("/logs/email/stats/summary", protect, authorizeRoles("admin"), getEmailStats);

export default router;
