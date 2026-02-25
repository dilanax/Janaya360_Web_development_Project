/**
 * Middleware to restrict access based on user roles.
 * Supports multiple roles (e.g., authorizeRoles('admin', 'auditor'))
 */
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    // 1. Check if user object exists (populated by protect middleware)
    if (!req.user) {
      return res.status(401).json({ 
        message: "Not authorized, user data missing" 
      });
    }

    // 2. Check if the user's role is included in the allowed roles
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Access denied: Role '${req.user.role}' does not have permission` 
      });
    }

    // 3. User is authorized, proceed to the next middleware/controller
    next();
  };
};