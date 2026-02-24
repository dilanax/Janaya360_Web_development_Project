import User from "../Model/user.js";
import jwt from "jsonwebtoken";

// 🔐 Generate JWT
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};



// =============================
// REGISTER USER
// =============================
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone, district, role } = req.body;

    // Required field validation
    if (!name || !email || !password || !phone || !district) {
      return res.status(400).json({ message: "All required fields must be filled" });
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
      role: role || "citizen", // default role
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



// =============================
// LOGIN USER
// =============================
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