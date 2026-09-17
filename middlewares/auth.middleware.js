const jwt = require("jsonwebtoken");
const User = require("../modules/user/user.model");
const logger = require("../utils/logger");

const authMiddleware = async (req, res, next) => {
  try {
    let token;

    // 1️⃣ Get token from header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, token missing",
      });
    }

    // 2️⃣ Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // 3️⃣ Get user from DB
    const user = await User.findById(decoded.id)
      .populate("role", "alias")
      .populate("organization");

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: "User not found or inactive",
      });
    }
    // 4️⃣ Attach user to request
    req.user = user;
    res.locals = user;
    res.locals.userId = decoded.id;
    res.locals.orgId = decoded.orgId;
    res.locals.role = user.role?.alias;
    next();
  } catch (error) {
    logger.error({ message: error.message }, "Authentication Error");

    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

module.exports = authMiddleware;
