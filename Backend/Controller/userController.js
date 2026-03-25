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

const buildAuthUserResponse = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  district: user.district,
  role: user.role,
  status: user.status,
  token: generateToken(user._id, user.role),
});

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

    if (!name || !email || !password || !phone || !district) {
      return res.status(400).json({ message: "Name, email, password, phone and district are required" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPhone = phone.trim();
    const safeRole = role === "admin" ? "admin" : "citizen";

    const userExists = await User.findOne({ email: normalizedEmail });
    if (userExists) {
      return res.status(400).json({ message: "Email is already in use" });
    }

    const phoneExists = await User.findOne({ phone: normalizedPhone });
    if (phoneExists) {
      return res.status(400).json({ message: "Phone number is already in use" });
    }

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      phone: normalizedPhone,
      district,
      role: safeRole,
    });

    res.status(201).json(buildAuthUserResponse(user));

  } catch (error) {
    if (error.code === 11000) {
      if (error.keyPattern?.email) {
        return res.status(400).json({ message: "Email is already in use" });
      }

      if (error.keyPattern?.phone) {
        return res.status(400).json({ message: "Phone number is already in use" });
      }

      return res.status(400).json({ message: "User already exists" });
    }

    if (error.name === "ValidationError") {
      const firstError = Object.values(error.errors)[0];
      return res.status(400).json({ message: firstError?.message || "Invalid registration details" });
    }

    res.status(500).json({ message: error.message });
  }
};

export const createUserByAdmin = async (req, res) => {
  try {
    const { name, email, password, phone, district, role, status } = req.body;

    if (!name || !email || !password || !phone || !district) {
      return res.status(400).json({ message: "Name, email, password, phone and district are required" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPhone = phone.trim();
    const userExists = await User.findOne({ email: normalizedEmail });
    if (userExists) {
      return res.status(400).json({ message: "Email is already in use" });
    }

    const phoneExists = await User.findOne({ phone: normalizedPhone });
    if (phoneExists) {
      return res.status(400).json({ message: "Phone number is already in use" });
    }

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      phone: normalizedPhone,
      district,
      role: role === "admin" ? "admin" : "citizen",
      status: status === "suspended" ? "suspended" : "active",
    });

    res.status(201).json({
      message: "User created successfully",
      user: await User.findById(user._id).select("-password"),
    });
  } catch (error) {
    if (error.code === 11000) {
      if (error.keyPattern?.email) {
        return res.status(400).json({ message: "Email is already in use" });
      }

      if (error.keyPattern?.phone) {
        return res.status(400).json({ message: "Phone number is already in use" });
      }

      return res.status(400).json({ message: "User already exists" });
    }

    if (error.name === "ValidationError") {
      const firstError = Object.values(error.errors)[0];
      return res.status(400).json({ message: firstError?.message || "Invalid user details" });
    }

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
      ...buildAuthUserResponse(user),
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

    res.json(buildAuthUserResponse(user));

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET CURRENT USER PROFILE
export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("+password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const nextPhone = req.body.phone ? req.body.phone.trim() : user.phone;

    if (nextPhone !== user.phone) {
      const phoneExists = await User.findOne({ phone: nextPhone, _id: { $ne: user._id } });
      if (phoneExists) {
        return res.status(400).json({ message: "Phone number is already in use" });
      }
    }

    user.name = req.body.name || user.name;
    user.phone = nextPhone;
    user.district = req.body.district || user.district;

    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.json({
      message: "Profile updated successfully",
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        district: updatedUser.district,
        role: updatedUser.role,
        status: updatedUser.status,
      },
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
    const { q } = req.query;
    const filter = {};

    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } },
        { phone: { $regex: q, $options: "i" } },
        { district: { $regex: q, $options: "i" } },
        { role: { $regex: q, $options: "i" } },
        { status: { $regex: q, $options: "i" } },
      ];
    }

    const users = await User.find(filter).select("-password").sort({ createdAt: -1 });
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
    if (req.user._id.toString() === req.params.id) {
      return res.status(400).json({ message: "You cannot delete your own admin account" });
    }

    const deletedUser = await User.findByIdAndDelete(req.params.id);

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

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

    const nextEmail = req.body.email ? req.body.email.trim().toLowerCase() : user.email;
    const nextPhone = req.body.phone ? req.body.phone.trim() : user.phone;

    if (nextEmail !== user.email) {
      const emailExists = await User.findOne({ email: nextEmail, _id: { $ne: user._id } });
      if (emailExists) {
        return res.status(400).json({ message: "Email is already in use" });
      }
    }

    if (nextPhone !== user.phone) {
      const phoneExists = await User.findOne({ phone: nextPhone, _id: { $ne: user._id } });
      if (phoneExists) {
        return res.status(400).json({ message: "Phone number is already in use" });
      }
    }

    user.name = req.body.name || user.name;
    user.email = nextEmail;
    user.phone = nextPhone;
    user.district = req.body.district || user.district;

    if (req.user.role === "admin" && req.body.role) {
      user.role = req.body.role;
    }

    if (req.user.role === "admin" && req.body.status) {
      user.status = req.body.status;
    }

    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.json({
      message: "User updated successfully",
      user: await User.findById(updatedUser._id).select("-password")
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
