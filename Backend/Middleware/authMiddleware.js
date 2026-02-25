import jwt from "jsonwebtoken";
import User from "../Model/user.js";

// 🔐 Protect Routes (Logged-in users only)
export const protect = async (req, res, next) => {
  let token;

  try {
    // Check if Authorization header exists
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      // Get token from header
      token = req.headers.authorization.split(" ")[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Attach user to request (without password)
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        return res.status(401).json({
          message: "User not found",
        });
      }

      return next();
    }

    // If no token
    return res.status(401).json({
      message: "Not authorized, no token",
    });

  } catch (error) {
    return res.status(401).json({
      message: "Not authorized, token failed",
    });
  }
};


// 🔐 Admin Only Middleware
export const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    return next();
  }

  return res.status(403).json({
    message: "Access denied. Admin only.",
  });
};