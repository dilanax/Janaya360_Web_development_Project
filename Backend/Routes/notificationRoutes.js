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

// ==================== PUBLIC/UNPROTECTED ROUTES ====================
// View all notifications (admin only)
router.get("/", protect, authorizeRoles("admin"), viewNotifications);

// ==================== PROTECTED ROUTES (All Users) ====================
// Get current user's notifications
router.get("/my", protect, getMyNotifications);

// Get user's notification statistics
router.get("/stats", protect, getNotificationStats);

// Get notifications filtered by date and type
router.get("/filter", protect, filterNotifications);

// Get notifications by type (general, complaint_update, emergency_alert)
router.get("/type/:type", protect, getNotificationsByType);

// Mark notifications as read - both specific and all
router.patch("/read/:notificationId", protect, markAsRead);
router.patch("/read", protect, markAsRead);

// ==================== ADMIN ONLY ROUTES ====================
// Create a new notification
router.post("/", protect, authorizeRoles("admin"), createNotification);

// Send notification to users (can be specific users, role-based, or all)
router.post("/send", protect, authorizeRoles("admin"), sendNotification);

// Create and send promotional notification to all or specific role
router.post("/promotional", protect, authorizeRoles("admin"), createPromotionalNotification);

// Create notification for specific user
router.post("/for-user", protect, authorizeRoles("admin"), createNotificationForUser);

// Update notification details
router.put("/:id", protect, authorizeRoles("admin"), updateNotification);

// Update notification status (unread, read, archived, overdue)
router.patch("/:id/status", protect, authorizeRoles("admin"), updateNotificationStatus);

// Get notifications by status
router.get("/status/:status", protect, authorizeRoles("admin"), getNotificationsByStatus);

// Mark notification as expired/overdue
router.patch("/:id/expire", protect, authorizeRoles("admin"), markAsExpired);

// Mark notification as deleted/archived
router.patch("/:id/delete", protect, authorizeRoles("admin"), markAsDeleted);

// Auto-expire old notifications based on expiry date
router.post("/auto-expire", protect, authorizeRoles("admin"), autoExpireNotifications);

// Delete notification permanently
router.delete("/:id", protect, authorizeRoles("admin"), deleteNotification);

// ==================== ADMIN LOGGING & AUDIT ROUTES ====================
// Get all OTP activity logs
router.get("/logs/otp/all", protect, authorizeRoles("admin"), getOTPActivityLogs);

// Get all email activity logs
router.get("/logs/email/all", protect, authorizeRoles("admin"), getEmailActivityLogs);

// Get OTP logs for specific email
router.get("/logs/otp/:email", protect, authorizeRoles("admin"), getOTPLogsForEmail);

// Get email logs for specific address
router.get("/logs/email/:email", protect, authorizeRoles("admin"), getEmailLogsForAddress);

// Get email sending statistics
router.get("/logs/email/stats/summary", protect, authorizeRoles("admin"), getEmailStats);

export default router;
