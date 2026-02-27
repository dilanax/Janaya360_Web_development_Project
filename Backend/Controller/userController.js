import User from "../Model/user.js";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";

// 🔐 Generate JWT
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

// Generate random 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Configure email transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: false, // Use TLS (not SSL)
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

// Ensure logs directory exists
const logsDir = "./Logs";
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// Log OTP activity
const logOTPActivity = (emailData) => {
  const logFile = path.join(logsDir, "otp_log.json");
  let logs = [];
  
  if (fs.existsSync(logFile)) {
    const data = fs.readFileSync(logFile, "utf8");
    logs = data ? JSON.parse(data) : [];
  }
  
  logs.push({
    timestamp: new Date().toISOString(),
    ...emailData
  });
  
  fs.writeFileSync(logFile, JSON.stringify(logs, null, 2));
};

// REGISTER
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone, district, role } = req.body;

    if (!name || !email || !password || !phone || !district || !role) {
      return res.status(400).json({ message: "All fields required" });
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      phone,
      district,
      role: role || "citizen"
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id, user.role),
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// SEND OTP
export const sendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.status !== "active") {
      return res.status(403).json({ message: "Account is suspended" });
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Update user with OTP
    user.otp = otp;
    user.otpExpiry = otpExpiry;
    user.otpVerified = false;
    await user.save();

    console.log(`\n🔐 OTP GENERATED FOR ${email}: ${otp}`);
    console.log(`⏱️  Expiry Time: ${otpExpiry}\n`);

    // Log OTP activity
    logOTPActivity({
      action: "OTP_SENT",
      email: email,
      otp: otp,
      status: "success"
    });

    // Try to send OTP via email
    if (process.env.SMTP_USER && process.env.SMTP_PASSWORD) {
      const mailOptions = {
        from: process.env.SMTP_USER,
        to: email,
        subject: "Justice Link - OTP Verification",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #667eea;">Justice Link - OTP Verification</h2>
            <p>Hello ${user.name},</p>
            <p>Your One-Time Password (OTP) for login is:</p>
            <h1 style="color: #667eea; letter-spacing: 5px; text-align: center;">${otp}</h1>
            <p style="color: #666;">This OTP will expire in 10 minutes.</p>
            <p style="color: #999; font-size: 12px;">If you didn't request this, please ignore this email.</p>
          </div>
        `
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error(`❌ Email Send Error: ${error.message}`);
          logOTPActivity({
            action: "OTP_SEND_FAILED",
            email: email,
            error: error.message,
            otp: otp
          });
        } else {
          console.log(`✅ Email sent successfully to ${email}`);
          logOTPActivity({
            action: "OTP_EMAIL_SENT",
            email: email,
            status: "email_delivered"
          });
        }
      });
    } else {
      console.warn("⚠️  SMTP credentials not configured. OTP logging to console only.");
    }

    res.json({ message: "OTP sent to your email", otp: otp });

  } catch (error) {
    console.error(`❌ OTP Error: ${error.message}`);
    logOTPActivity({
      action: "OTP_ERROR",
      error: error.message
    });
    res.status(500).json({ message: error.message });
  }
};

// VERIFY OTP
export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check OTP expiry
    if (!user.otpExpiry || new Date() > user.otpExpiry) {
      return res.status(400).json({ message: "OTP has expired" });
    }

    // Verify OTP
    if (user.otp !== otp) {
      logOTPActivity({
        action: "OTP_VERIFICATION_FAILED",
        email: email,
        reason: "Invalid OTP"
      });
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // Mark OTP as verified
    user.otpVerified = true;
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    logOTPActivity({
      action: "OTP_VERIFIED",
      email: email,
      status: "success"
    });

    res.json({
      message: "OTP verified successfully",
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id, user.role),
    });

  } catch (error) {
    logOTPActivity({
      action: "OTP_VERIFICATION_ERROR",
      error: error.message
    });
    res.status(500).json({ message: error.message });
  }
};

// LOGIN
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 🔥 Important fix: select password explicitly
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (user.status !== "active") {
      return res.status(403).json({ message: "Account suspended" });
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id, user.role),
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// =============================
// GET ALL USERS (Admin only)
// =============================
export const getUsers = async (req, res) => {
  try {
    // ⚠️ Add admin middleware check here if needed
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// =============================
// SEARCH USER BY EMAIL
// =============================
export const searchUserByEmail = async (req, res) => {
  try {
    const { email } = req.query;

    const user = await User.findOne({ email }).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// =============================
// DELETE USER (Admin only)
// =============================
export const deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// =============================
// UPDATE USER (Admin or Self)
// =============================
export const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("+password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update allowed fields only
    user.name = req.body.name || user.name;
    user.phone = req.body.phone || user.phone;
    user.district = req.body.district || user.district;

    // Optional: Allow role change only by admin
    if (req.user.role === "admin" && req.body.role) {
      user.role = req.body.role;
    }

    // If password is changing
    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.json({
      message: "User updated successfully",
      user: updatedUser
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};