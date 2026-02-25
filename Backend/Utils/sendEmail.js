import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Email logging configuration
const LOG_DIR = path.join(__dirname, "../Logs");
const OTP_LOG_FILE = path.join(LOG_DIR, "otp_log.json");
const EMAIL_LOG_FILE = path.join(LOG_DIR, "email_log.json");

// Create logs directory if it doesn't exist
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

// Initialize log files if they don't exist
if (!fs.existsSync(OTP_LOG_FILE)) {
  fs.writeFileSync(OTP_LOG_FILE, JSON.stringify([], null, 2));
}
if (!fs.existsSync(EMAIL_LOG_FILE)) {
  fs.writeFileSync(EMAIL_LOG_FILE, JSON.stringify([], null, 2));
}


const getTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: process.env.SMTP_PORT || 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};


const logOTPRecord = (email, otp, action = "generated", status = "success") => {
  try {
    const otpLogs = JSON.parse(fs.readFileSync(OTP_LOG_FILE, "utf8"));
    
    const record = {
      timestamp: new Date().toISOString(),
      email: email,
      otp: otp,
      action: action,
      status: status,
      expiryTime: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 minutes
      ipAddress: process.env.USER_IP || "unknown"
    };

    otpLogs.push(record);
    
    // Keep only last 1000 records
    if (otpLogs.length > 1000) {
      otpLogs.shift();
    }

    fs.writeFileSync(OTP_LOG_FILE, JSON.stringify(otpLogs, null, 2));
    console.log(`[OTP LOG] ${action.toUpperCase()} - Email: ${email}, Status: ${status}`);
  } catch (error) {
    console.error("Error logging OTP record:", error);
  }
};


const logEmailRecord = (email, type, subject, status = "success", error = null) => {
  try {
    const emailLogs = JSON.parse(fs.readFileSync(EMAIL_LOG_FILE, "utf8"));
    
    const record = {
      timestamp: new Date().toISOString(),
      email: email,
      type: type, // "otp", "notification", "alert", etc.
      subject: subject,
      status: status,
      errorMessage: error ? error.message : null,
      responseCode: error ? error.code : null
    };

    emailLogs.push(record);
    
    // Keep only last 500 records
    if (emailLogs.length > 500) {
      emailLogs.shift();
    }

    fs.writeFileSync(EMAIL_LOG_FILE, JSON.stringify(emailLogs, null, 2));
    console.log(`[EMAIL LOG] ${type.toUpperCase()} - To: ${email}, Status: ${status}`);
  } catch (error) {
    console.error("Error logging email record:", error);
  }
};


export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};


export const sendOTPEmail = async (email, otp, userName = null) => {
  try {
    if (!email || !otp) {
      throw new Error("Email and OTP are required");
    }

    const transporter = getTransporter();

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f5f5f5;">
        <div style="background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <h2 style="color: #333; margin-bottom: 10px;">Welcome to JusticeLink!</h2>
          <p style="color: #666; font-size: 14px;">Hi ${userName || "User"},</p>
          
          <p style="color: #666; margin: 20px 0;">Your One-Time Password (OTP) for login is:</p>
          
          <div style="background: #f0f0f0; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
            <h1 style="color: #d32f2f; letter-spacing: 5px; margin: 0;">${otp}</h1>
          </div>
          
          <p style="color: #666; font-size: 14px;">
            <strong>⏱️ Valid for:</strong> 5 minutes<br>
            <strong>🕐 Generated at:</strong> ${new Date().toLocaleString()}
          </p>
          
          <p style="color: #999; font-size: 12px; margin-top: 30px;">
            ⚠️ <strong>Security Notice:</strong> Never share this OTP with anyone. Our team will never ask for your OTP.
          </p>
          
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          
          <p style="color: #999; font-size: 12px; text-align: center;">
            © 2026 JusticeLink. All rights reserved.<br>
            <a href="${process.env.FRONTEND_URL || "http://localhost:3000"}" style="color: #d32f2f; text-decoration: none;">Visit our website</a>
          </p>
        </div>
      </div>
    `;

    const info = await transporter.sendMail({
      from: `"JusticeLink - OTP Verification" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "🔐 Your JusticeLink OTP Code",
      html: htmlContent,
      text: `Your OTP is ${otp}. It is valid for 5 minutes. Never share this OTP with anyone.`
    });

    logOTPRecord(email, otp, "sent", "success");
    logEmailRecord(email, "otp", "Login OTP", "success");

    console.log(`✅ OTP email sent to ${email} successfully`);
    return { success: true, messageId: info.messageId, email: email };

  } catch (error) {
    console.error("❌ OTP email sending failed:", error.message);
    logOTPRecord(email, otp, "sent", "failed");
    logEmailRecord(email, "otp", "Login OTP", "failed", error);
    throw error;
  }
};


export const sendNotificationEmail = async (email, notification, userName = null) => {
  try {
    if (!email || !notification) {
      throw new Error("Email and notification are required");
    }

    const transporter = getTransporter();

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <h2 style="color: #333; margin-bottom: 5px;">${notification.title}</h2>
          <p style="color: #999; font-size: 12px; margin-bottom: 20px;">📬 Notification - ${new Date(notification.sendDate).toLocaleString()}</p>
          
          <div style="background: #f9f9f9; padding: 20px; border-left: 4px solid #d32f2f; margin: 20px 0;">
            <p style="color: #333; line-height: 1.6; margin: 0;">${notification.body}</p>
          </div>
          
          <p style="color: #666; font-size: 14px;">
            <strong>Notification Type:</strong> ${notification.type.replace(/_/g, " ").toUpperCase()}<br>
            <strong>Status:</strong> <span style="color: #4caf50;">${notification.status.toUpperCase()}</span>
          </p>
          
          <p style="color: #666; margin-top: 20px; font-size: 14px;">
            Log in to your JusticeLink account to view more details and manage your notifications.
          </p>
          
          <a href="${process.env.FRONTEND_URL || "http://localhost:3000"}/notifications" style="display: inline-block; margin-top: 20px; padding: 12px 24px; background: #d32f2f; color: white; text-decoration: none; border-radius: 4px; font-weight: bold;">
            View Notification
          </a>
          
          <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
          
          <p style="color: #999; font-size: 12px;">
            © 2026 JusticeLink. All rights reserved.
          </p>
        </div>
      </div>
    `;

    const info = await transporter.sendMail({
      from: `"JusticeLink Notifications" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `📬 New Notification: ${notification.title}`,
      html: htmlContent,
      text: `${notification.title}\n\n${notification.body}`
    });

    logEmailRecord(email, "notification", notification.title, "success");
    console.log(`✅ Notification email sent to ${email}`);
    return { success: true, messageId: info.messageId, email: email };

  } catch (error) {
    console.error("❌ Notification email sending failed:", error.message);
    logEmailRecord(email, "notification", notification.title, "failed", error);
    throw error;
  }
};


export const sendAlertEmail = async (email, alert) => {
  try {
    if (!email || !alert) {
      throw new Error("Email and alert are required");
    }

    const transporter = getTransporter();

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #fff3cd; padding: 30px; border-radius: 8px; border: 2px solid #ff6b6b;">
          <h2 style="color: #ff6b6b; margin-bottom: 5px;">⚠️ URGENT ALERT</h2>
          <p style="color: #666; font-size: 12px; margin-bottom: 20px;">Emergency - ${new Date().toLocaleString()}</p>
          
          <div style="background: white; padding: 20px; border-radius: 4px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">${alert.title}</h3>
            <p style="color: #333; line-height: 1.6;">${alert.body}</p>
          </div>
          
          <p style="color: #d32f2f; font-weight: bold; margin: 20px 0;">
            ⚡ This is a high-priority alert requiring immediate attention.
          </p>
          
          <a href="${process.env.FRONTEND_URL || "http://localhost:3000"}/alerts" style="display: inline-block; margin-top: 20px; padding: 12px 24px; background: #ff6b6b; color: white; text-decoration: none; border-radius: 4px; font-weight: bold;">
            View Alert Details
          </a>
          
          <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
          
          <p style="color: #999; font-size: 12px;">
            © 2026 JusticeLink. All rights reserved.
          </p>
        </div>
      </div>
    `;

    const info = await transporter.sendMail({
      from: `"JusticeLink Emergency Alert" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `🚨 EMERGENCY ALERT: ${alert.title}`,
      html: htmlContent,
      text: `EMERGENCY: ${alert.title}\n\n${alert.body}`
    });

    logEmailRecord(email, "alert", alert.title, "success");
    console.log(`✅ Alert email sent to ${email}`);
    return { success: true, messageId: info.messageId, email: email };

  } catch (error) {
    console.error("❌ Alert email sending failed:", error.message);
    logEmailRecord(email, "alert", alert.title, "failed", error);
    throw error;
  }
};


export const sendBatchEmails = async (emailList, emailType, content) => {
  try {
    if (!emailList || emailList.length === 0) {
      throw new Error("Email list is empty");
    }

    const transporter = getTransporter();
    const results = { success: [], failed: [] };

    for (const email of emailList) {
      try {
        const info = await transporter.sendMail({
          from: `"JusticeLink" <${process.env.EMAIL_USER}>`,
          to: email,
          subject: content.subject,
          html: content.html,
          text: content.text
        });

        logEmailRecord(email, emailType, content.subject, "success");
        results.success.push(email);
      } catch (error) {
        logEmailRecord(email, emailType, content.subject, "failed", error);
        results.failed.push({ email, error: error.message });
      }
    }

    console.log(`✅ Batch email sent: ${results.success.length} successful, ${results.failed.length} failed`);
    return results;

  } catch (error) {
    console.error("❌ Batch email sending failed:", error.message);
    throw error;
  }
};


export const sendEmail = async (options) => {
  try {
    const { to, subject, html, text } = options;

    if (!to || !subject || !html) {
      throw new Error("Email, subject, and HTML content are required");
    }

    const transporter = getTransporter();

    const info = await transporter.sendMail({
      from: `"JusticeLink" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: subject,
      html: html,
      text: text || html
    });

    logEmailRecord(to, "generic", subject, "success");
    return { success: true, messageId: info.messageId };

  } catch (error) {
    console.error("❌ Email sending failed:", error.message);
    logEmailRecord(options.to || "unknown", "generic", options.subject || "unknown", "failed", error);
    throw error;
  }
};


export const verifyOTP = (email, providedOTP) => {
  try {
    const otpLogs = JSON.parse(fs.readFileSync(OTP_LOG_FILE, "utf8"));
    
    const recentOTP = otpLogs
      .filter(log => log.email === email && log.action === "sent")
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];

    if (!recentOTP) {
      return { valid: false, message: "No OTP found for this email" };
    }

    // Check if OTP has expired (5 minutes)
    const now = new Date();
    const expiryTime = new Date(recentOTP.expiryTime);
    
    if (now > expiryTime) {
      return { valid: false, message: "OTP has expired" };
    }

    // Check if OTP matches
    if (recentOTP.otp !== providedOTP) {
      return { valid: false, message: "Invalid OTP" };
    }

    return { valid: true, message: "OTP verified successfully" };

  } catch (error) {
    console.error("Error verifying OTP:", error);
    return { valid: false, message: "Error verifying OTP" };
  }
};


export const getOTPLogs = (limit = 50) => {
  try {
    const otpLogs = JSON.parse(fs.readFileSync(OTP_LOG_FILE, "utf8"));
    return otpLogs.slice(-limit).reverse();
  } catch (error) {
    console.error("Error reading OTP logs:", error);
    return [];
  }
};


export const getEmailLogs = (limit = 50) => {
  try {
    const emailLogs = JSON.parse(fs.readFileSync(EMAIL_LOG_FILE, "utf8"));
    return emailLogs.slice(-limit).reverse();
  } catch (error) {
    console.error("Error reading email logs:", error);
    return [];
  }
};
