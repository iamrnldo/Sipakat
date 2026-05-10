const express = require("express");
const router = express.Router();
const {
  login,
  logout,
  getMe,
  changePassword,
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

// @route   POST /api/auth/login
router.post("/login", login);

// @route   POST /api/auth/logout
router.post("/logout", protect, logout);

// @route   GET /api/auth/me
router.get("/me", protect, getMe);

// @route   PUT /api/auth/change-password
router.put("/change-password", protect, changePassword);

module.exports = router;
