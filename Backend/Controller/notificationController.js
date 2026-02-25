import mongoose from 'mongoose';
import Notification  from '../Model/notification.js';
import UserNotification from '../Model/userNotification.js';
import User from '../Model/user.js';
import { 
  sendNotificationEmail, 
  sendAlertEmail, 
  sendBatchEmails,
  sendEmail,
  getOTPLogs,
  getEmailLogs
} from '../Utils/sendEmail.js';

export async function createNotification(req, res) {
  try {
    const { title, body, type = "general", recipients, expiryDays = 7 } = req.body;

    // Validate required fields
    if (!title || !body || !type) {
      return res.status(400).json({ message: 'title, body, and type are required' });
    }

    // Validate notification type
    const validTypes = ["general", "complaint_update", "emergency_alert"];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ message: `Invalid notification type. Must be one of: ${validTypes.join(', ')}` });
    }

    // Calculate expiry date
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + expiryDays);

    // Create notification
    const notification = new Notification({
      title,
      body,
      type,
      status: 'unread',
      deliveredTo: req.user?._id || null,
      sendDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      expiryDate: expiryDate
    });

    await notification.save();

    res.status(201).json({
      message: 'Notification created successfully',
      notificationId: notification._id,
      notification: notification
    });

  } catch (error) {
    console.error('createNotification error:', error);
    res.status(500).json({ message: 'Failed to create notification', error: error.message });
  }
}



export async function sendNotification(req, res) {
  try {
    const { notificationId, recipientUserIds, sendToRole } = req.body;

    if (!notificationId) {
      return res.status(400).json({ message: 'notificationId is required' });
    }

    // Find the notification
    const notification = await Notification.findById(notificationId);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    let recipients = [];

    // Determine recipients based on criteria
    if (recipientUserIds && recipientUserIds.length > 0) {
      // Send to specific users
      recipients = await User.find({ _id: { $in: recipientUserIds } });
    } else if (sendToRole) {
      // Send to users with specific role
      recipients = await User.find({ role: sendToRole });
    } else {
      // Send to all users by default
      recipients = await User.find();
    }

    if (recipients.length === 0) {
      return res.status(400).json({ message: 'No recipients found' });
    }

    const sentRecords = [];
    const failedRecords = [];

    // Send notifications based on user type and notification type
    for (const recipient of recipients) {
      try {
        // Create UserNotification record
        const userNotif = new UserNotification({
          NIC: notification._id,
          user_id: recipient._id,
          readStatus: false,
          readAt: null
        });
        await userNotif.save();
        sentRecords.push(recipient._id);

        // Send different notifications based on user role and notification type
        await sendNotificationByUserType(recipient, notification);

        // Real-time notification via socket
        if (req.io) {
          req.io.to(recipient._id.toString()).emit('notification', {
            userId: recipient._id.toString(),
            id: notification._id,
            title: notification.title,
            body: notification.body,
            type: notification.type,
            createdAt: notification.sendDate
          });
        }
      } catch (error) {
        console.error(`Failed to send notification to ${recipient._id}:`, error);
        failedRecords.push(recipient._id);
      }
    }

    // Update notification status
    notification.status = 'read'; // Changed from sent to read
    await notification.save();

    res.status(200).json({
      message: 'Notifications sent successfully',
      sentCount: sentRecords.length,
      failedCount: failedRecords.length,
      sentTo: sentRecords,
      failedTo: failedRecords
    });

  } catch (error) {
    console.error('sendNotification error:', error);
    res.status(500).json({ message: 'Failed to send notifications', error: error.message });
  }
}


async function sendNotificationByUserType(user, notification) {
  try {
    if (!user.email) {
      console.warn(`User ${user._id} has no email address. Skipping email notification.`);
      return;
    }

    // Send different email templates based on notification type
    if (notification.type === 'emergency_alert') {
      await sendAlertEmail(user.email, {
        title: notification.title,
        body: notification.body
      });
    } else {
      await sendNotificationEmail(user.email, notification, user.name);
    }

    console.log(`✅ Email notification sent to ${user.email} (${user.role})`);
  } catch (error) {
    console.error(`❌ Error sending notification to user ${user._id}:`, error.message);
  }
}

async function sendEmailsByRole(role, notification) {
  try {
    let users;
    if (role === 'all') {
      users = await User.find();
    } else {
      users = await User.find({ role: role });
    }

    const emailList = users
      .filter(user => user.email)
      .map(user => user.email);

    if (emailList.length === 0) {
      console.warn(`No valid email addresses found for role: ${role}`);
      return { success: 0, failed: 0 };
    }

    // Create email content based on notification type
    let emailContent;
    if (notification.type === 'emergency_alert') {
      emailContent = {
        subject: `🚨 EMERGENCY ALERT: ${notification.title}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: #fff3cd; padding: 30px; border-radius: 8px; border: 2px solid #ff6b6b;">
              <h2 style="color: #ff6b6b; margin-bottom: 5px;">⚠️ EMERGENCY ALERT - ${role.toUpperCase()}</h2>
              <p style="color: #666; font-size: 12px; margin-bottom: 20px;">Sent: ${new Date().toLocaleString()}</p>
              <div style="background: white; padding: 20px; border-radius: 4px; margin: 20px 0;">
                <h3 style="color: #333; margin-top: 0;">${notification.title}</h3>
                <p style="color: #333; line-height: 1.6;">${notification.body}</p>
              </div>
              <p style="color: #d32f2f; font-weight: bold;">⚡ This requires immediate attention!</p>
            </div>
          </div>
        `,
        text: `EMERGENCY: ${notification.title}\n\n${notification.body}`
      };
    } else {
      emailContent = {
        subject: `📬 Notification: ${notification.title}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: white; padding: 30px; border-radius: 8px;">
              <h2 style="color: #333;">${notification.title}</h2>
              <p style="color: #666; font-size: 12px; margin-bottom: 20px;">${notification.type.replace(/_/g, ' ').toUpperCase()} - ${new Date(notification.sendDate).toLocaleString()}</p>
              <div style="background: #f9f9f9; padding: 20px; border-left: 4px solid #d32f2f;">
                <p style="color: #333; line-height: 1.6;">${notification.body}</p>
              </div>
              <p style="color: #666; margin-top: 20px;">Log in to your account to manage this notification.</p>
            </div>
          </div>
        `,
        text: `${notification.title}\n\n${notification.body}`
      };
    }

    const results = await sendBatchEmails(emailList, 'notification', emailContent);
    console.log(`✅ Notification emails sent to ${role}: ${results.success.length} success, ${results.failed.length} failed`);
    return { success: results.success.length, failed: results.failed.length, failedList: results.failed };

  } catch (error) {
    console.error(`❌ Error sending emails by role:`, error.message);
    return { success: 0, failed: 0, error: error.message };
  }
}


export async function updateNotificationStatus(req, res) {
  try {
    const { notificationId } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: 'status is required' });
    }

    const validStatuses = ['unread', 'read', 'archived', 'overdue'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      { 
        status: status,
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json({
      message: 'Notification status updated successfully',
      notification: notification
    });

  } catch (error) {
    console.error('updateNotificationStatus error:', error);
    res.status(500).json({ message: 'Failed to update notification status', error: error.message });
  }
}


export async function markAsExpired(req, res) {
  try {
    const { notificationId } = req.params;

    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      { 
        status: 'overdue',
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json({
      message: 'Notification marked as expired/overdue',
      notification: notification
    });

  } catch (error) {
    console.error('markAsExpired error:', error);
    res.status(500).json({ message: 'Failed to mark notification as expired', error: error.message });
  }
}


export async function autoExpireNotifications(req, res) {
  try {
    const now = new Date();

    const result = await Notification.updateMany(
      {
        expiryDate: { $lt: now },
        status: { $ne: 'overdue' }
      },
      {
        status: 'overdue',
        updatedAt: now
      }
    );

    res.json({
      message: 'Auto-expiration completed',
      expiredCount: result.modifiedCount || 0
    });

  } catch (error) {
    console.error('autoExpireNotifications error:', error);
    res.status(500).json({ message: 'Failed to auto-expire notifications', error: error.message });
  }
}


export async function markAsDeleted(req, res) {
  try {
    const { notificationId } = req.params;

    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      { 
        status: 'archived',
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json({
      message: 'Notification marked as archived',
      notification: notification
    });

  } catch (error) {
    console.error('markAsDeleted error:', error);
    res.status(500).json({ message: 'Failed to mark notification as archived', error: error.message });
  }
}

export function viewNotifications(req, res) {
  Notification.find().sort({ sendDate: -1 })
    .then((notifi) => res.json(notifi))
    .catch((error) => {
      console.error(error);
      res.status(500).json({ message: 'Notification loading failed' });
    });
}

export async function getMyNotifications(req, res) {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    const userId =
      typeof req.user._id === 'string'
        ? new mongoose.Types.ObjectId(req.user._id)
        : req.user._id;

    const rows = await UserNotification.aggregate([
      { $match: { user_id: userId } },
      {
        $lookup: {
          from: 'notifications',
          localField: 'NIC',
          foreignField: '_id',
          as: 'notification'
        }
      },
      { $unwind: '$notification' },
      {
        $project: {
          _id: 1,
          readStatus: 1,
          createdAt: 1,
          'notification._id': 1,
          'notification.title': 1,
          'notification.body': 1,
          'notification.type': 1,
          'notification.status': 1,
          'notification.sendDate': 1
        }
      },
      { $sort: { createdAt: -1 } }
    ]);

    const data = rows.map(r => ({
      id: r._id,               
      notificationId: r.notification._id,
      title: r.notification.title,
      body: r.notification.body,
      type: r.notification.type,
      status: r.notification.status,
      createdAt: r.notification.sendDate || r.createdAt,
      isRead: r.readStatus
    }));

    res.json(data);
  } catch (e) {
    console.error('getMyNotifications error:', e);
    res.status(500).json({ message: 'Failed to load notifications', error: e.message });
  }
}


export async function getNotificationsByType(req, res) {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    const { type } = req.params;
    const validTypes = ["general", "complaint_update", "emergency_alert"];
    
    if (!validTypes.includes(type)) {
      return res.status(400).json({ message: `Invalid type. Must be one of: ${validTypes.join(', ')}` });
    }

    const userId =
      typeof req.user._id === 'string'
        ? new mongoose.Types.ObjectId(req.user._id)
        : req.user._id;

    const rows = await UserNotification.aggregate([
      { $match: { user_id: userId } },
      {
        $lookup: {
          from: 'notifications',
          localField: 'NIC',
          foreignField: '_id',
          as: 'notification'
        }
      },
      { $unwind: '$notification' },
      { $match: { 'notification.type': type } },
      {
        $project: {
          _id: 1,
          readStatus: 1,
          createdAt: 1,
          'notification._id': 1,
          'notification.title': 1,
          'notification.body': 1,
          'notification.type': 1,
          'notification.status': 1,
          'notification.sendDate': 1
        }
      },
      { $sort: { createdAt: -1 } }
    ]);

    const data = rows.map(r => ({
      id: r._id,               
      notificationId: r.notification._id,
      title: r.notification.title,
      body: r.notification.body,
      type: r.notification.type,
      status: r.notification.status,
      createdAt: r.notification.sendDate || r.createdAt,
      isRead: r.readStatus
    }));

    res.json(data);
  } catch (e) {
    console.error('getNotificationsByType error:', e);
    res.status(500).json({ message: 'Failed to load notifications by type', error: e.message });
  }
}

export async function createPromotionalNotification(req, res) {
  try {
    const { title, body, recipientRole = "all", notificationType = "general" } = req.body;
    if (!title || !body) {
      return res.status(400).json({ message: "Please provide title and body." });
    }

    const adminName = req.user?.name || req.user?.username || 'Admin';

    const notification = new Notification({
      title,
      body,
      type: notificationType,
      status: "unread",
      deliveredTo: null,
      sendDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await notification.save();

    let members;
    if (recipientRole === "all") {
      members = await User.find();
    } else {
      members = await User.find({ role: recipientRole });
    }

    const bulk = members.map((m) => ({
      insertOne: {
        document: { NIC: notification._id, user_id: m._id, readStatus: false },
      },
    }));
    
    if (bulk.length) await UserNotification.bulkWrite(bulk);

    // Send notifications based on user role
    for (const member of members) {
      try {
        await sendNotificationByUserType(member, notification);
      } catch (error) {
        console.error(`Failed to send email to ${member.email}:`, error);
      }
    }

    // Real-time notification to all members
    if (req.io) {
      members.forEach(member => {
        req.io.to(member._id.toString()).emit('notification', {
          userId: member._id.toString(),
          id: notification._id,
          title: notification.title,
          body: notification.body,
          type: notification.type,
          createdAt: notification.sendDate
        });
      });
    }

    res.status(201).json({
      message: "Notification created and sent to members",
      notificationId: notification._id,
      affectedMembers: members.length,
      sentToRole: recipientRole
    });
  } catch (error) {
    console.error("createPromotionalNotification error:", error);
    res.status(500).json({ message: "Internal server error.", error: error.message });
  }
}

export async function createNotificationForUser(req, res) {
  try {
    const { title, body, type, userId } = req.body;
    if (!title || !body || !userId || !type) {
      return res.status(400).json({ message: 'title, body, userId, and type are required' });
    }

    const validTypes = ["general", "complaint_update", "emergency_alert"];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ message: `Invalid type. Must be one of: ${validTypes.join(', ')}` });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const notification = new Notification({
      title,
      body,
      type,
      status: 'unread',
      deliveredTo: userId,
      sendDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    await notification.save();

    // Create UserNotification record
    await new UserNotification({ 
      NIC: notification._id, 
      user_id: userId,
      readStatus: false 
    }).save();

    // Send notification email based on user role
    try {
      await sendNotificationByUserType(user, notification);
    } catch (emailError) {
      console.error(`Failed to send email to ${user.email}:`, emailError);
    }

    // Real-time notification to specific user
    if (req.io) {
      req.io.to(userId.toString()).emit('notification', {
        userId: userId.toString(),
        id: notification._id,
        title: notification.title,
        body: notification.body,
        type: notification.type,
        createdAt: notification.sendDate
      });
    }

    res.status(201).json({ 
      message: 'Notification created and sent to user',
      notificationId: notification._id,
      notification: notification
    });
  } catch (e) {
    console.error('createNotificationForUser error:', e);
    res.status(500).json({ message: 'Internal server error', error: e.message });
  }
}


export async function updateNotification(req, res) {
  const id = req.params.id;

  Notification.findOneAndUpdate(
    { $or: [{ _id: id }, { notificationID: id }] }, 
    { ...req.body, updatedAt: new Date() },
    { new: true }
  )
    .then((notifi) => {
      if (!notifi) {
        return res.status(404).json({ message: "Notification not found" });
      }
      res.json({ message: "Notification Updated Successfully", notification: notifi });
    })
    .catch((err) => {
      console.error("Notification update failed:", err);
      res.status(500).json({ message: "Notification update failed" });
    });
}


export function deleteNotification(req, res) {
  Notification.findOneAndDelete({ _id: req.params.id })
    .then(() => res.json({ message: 'Notification was Deleted' }))
    .catch(() => res.status(500).json({ message: 'Notification deletion failed' }));
}


export async function markAsRead(req, res) {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    
    const userId =
      typeof req.user._id === 'string'
        ? new mongoose.Types.ObjectId(req.user._id)
        : req.user._id;

    const { notificationId } = req.params;

    if (notificationId) {
      // Mark specific notification as read
      const result = await UserNotification.updateOne(
        { user_id: userId, NIC: notificationId },
        { $set: { readStatus: true, readAt: new Date() } }
      );
      
      return res.json({ 
        success: true, 
        modified: result.modifiedCount || 0,
        message: 'Notification marked as read'
      });
    } else {
      // Mark all notifications as read
      const result = await UserNotification.updateMany(
        { user_id: userId, readStatus: false },
        { $set: { readStatus: true, readAt: new Date() } }
      );
      
      return res.json({ 
        success: true, 
        modified: result.modifiedCount || 0,
        message: 'All notifications marked as read'
      });
    }
  } catch (error) {
    console.error('markAsRead error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function filterNotifications(req, res) {
  try {
    const { type, date } = req.query;
    const query = {};

    if (type && type !== "all") {
      query.type = type;
    }

    if (date && date !== "all") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      switch(date) {
        case "today":
          const todayStart = new Date(today);
          const todayEnd = new Date(today);
          todayEnd.setHours(23, 59, 59, 999);
          query.sendDate = { $gte: todayStart, $lte: todayEnd };
          break;

        case "last7days":
          const weekAgo = new Date(today);
          weekAgo.setDate(today.getDate() - 7);
          query.sendDate = { $gte: weekAgo };
          break;

        case "last30days":
          const monthAgo = new Date(today);
          monthAgo.setDate(today.getDate() - 30);
          query.sendDate = { $gte: monthAgo };
          break;
      }
    }

    const notifications = await Notification.find(query).sort({ sendDate: -1 });
    res.json(notifications);
  } catch (err) {
    console.log("Notification filtering failed: ", err);
    res.status(500).json({
      message: "Error filtering notifications"
    });
  }
}
export async function getNotificationsByStatus(req, res) {
  try {
    const { status } = req.params;
    const validStatuses = ['unread', 'read', 'archived', 'overdue'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    const notifications = await Notification.find({ status }).sort({ sendDate: -1 });
    
    res.json({
      status: status,
      count: notifications.length,
      notifications: notifications
    });

  } catch (error) {
    console.error('getNotificationsByStatus error:', error);
    res.status(500).json({ message: 'Failed to get notifications by status', error: error.message });
  }
}


export async function getNotificationStats(req, res) {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    const userId =
      typeof req.user._id === 'string'
        ? new mongoose.Types.ObjectId(req.user._id)
        : req.user._id;

    const totalCount = await UserNotification.countDocuments({ user_id: userId });
    const unreadCount = await UserNotification.countDocuments({ user_id: userId, readStatus: false });
    const readCount = await UserNotification.countDocuments({ user_id: userId, readStatus: true });

    const typeStats = await Notification.aggregate([
      {
        $lookup: {
          from: 'usernotifications',
          localField: '_id',
          foreignField: 'NIC',
          as: 'userNotifications'
        }
      },
      {
        $match: {
          'userNotifications.user_id': userId
        }
      },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      }
    ]);

    const statusStats = await Notification.aggregate([
      {
        $lookup: {
          from: 'usernotifications',
          localField: '_id',
          foreignField: 'NIC',
          as: 'userNotifications'
        }
      },
      {
        $match: {
          'userNotifications.user_id': userId
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      total: totalCount,
      unread: unreadCount,
      read: readCount,
      byType: typeStats,
      byStatus: statusStats
    });

  } catch (error) {
    console.error('getNotificationStats error:', error);
    res.status(500).json({ message: 'Failed to get notification statistics', error: error.message });
  }
}

// ==================== ADMIN LOGGING & AUDIT ENDPOINTS ====================
/**
 * Get OTP logs (Admin only) - View all OTP activities
 */
export async function getOTPActivityLogs(req, res) {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const limit = req.query.limit ? parseInt(req.query.limit) : 100;
    const logs = getOTPLogs(limit);

    res.json({
      message: 'OTP Activity Logs',
      totalRecords: logs.length,
      logs: logs
    });

  } catch (error) {
    console.error('getOTPActivityLogs error:', error);
    res.status(500).json({ message: 'Failed to retrieve OTP logs', error: error.message });
  }
}

/**
 * Get Email logs (Admin only) - View all email sending activities
 */
export async function getEmailActivityLogs(req, res) {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const limit = req.query.limit ? parseInt(req.query.limit) : 100;
    const logs = getEmailLogs(limit);

    res.json({
      message: 'Email Activity Logs',
      totalRecords: logs.length,
      logs: logs
    });

  } catch (error) {
    console.error('getEmailActivityLogs error:', error);
    res.status(500).json({ message: 'Failed to retrieve email logs', error: error.message });
  }
}

/**
 * Get OTP logs for specific email (Admin only)
 */
export async function getOTPLogsForEmail(req, res) {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const { email } = req.params;
    if (!email) {
      return res.status(400).json({ message: 'Email address is required' });
    }

    const logs = getOTPLogs(500);
    const emailOTPLogs = logs.filter(log => log.email === email);

    res.json({
      message: `OTP logs for ${email}`,
      totalRecords: emailOTPLogs.length,
      email: email,
      logs: emailOTPLogs
    });

  } catch (error) {
    console.error('getOTPLogsForEmail error:', error);
    res.status(500).json({ message: 'Failed to retrieve OTP logs', error: error.message });
  }
}

/**
 * Get email logs for specific address (Admin only)
 */
export async function getEmailLogsForAddress(req, res) {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const { email } = req.params;
    if (!email) {
      return res.status(400).json({ message: 'Email address is required' });
    }

    const logs = getEmailLogs(500);
    const emailLogs = logs.filter(log => log.email === email);

    res.json({
      message: `Email logs for ${email}`,
      totalRecords: emailLogs.length,
      email: email,
      logs: emailLogs
    });

  } catch (error) {
    console.error('getEmailLogsForAddress error:', error);
    res.status(500).json({ message: 'Failed to retrieve email logs', error: error.message });
  }
}
export async function getEmailStats(req, res) {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const logs = getEmailLogs(500);

    const stats = {
      totalEmails: logs.length,
      successCount: logs.filter(l => l.status === 'success').length,
      failedCount: logs.filter(l => l.status === 'failed').length,
      byType: {},
      failedByType: {}
    };

    // Count by type
    logs.forEach(log => {
      stats.byType[log.type] = (stats.byType[log.type] || 0) + 1;
      if (log.status === 'failed') {
        stats.failedByType[log.type] = (stats.failedByType[log.type] || 0) + 1;
      }
    });

    // Success rate
    stats.successRate = stats.totalEmails > 0 
      ? ((stats.successCount / stats.totalEmails) * 100).toFixed(2) + '%'
      : '0%';

    res.json({
      message: 'Email Statistics',
      statistics: stats
    });

  } catch (error) {
    console.error('getEmailStats error:', error);
    res.status(500).json({ message: 'Failed to retrieve email statistics', error: error.message });
  }
}

