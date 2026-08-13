const express = require("express");

const router = express.Router();

// ========================================
// CONTROLLERS
// ========================================

const {
  register,
  login,
  getMe,
  updateProfile,
  uploadProfileImage,
  changePassword,
} = require("../controllers/auth.controller");

// ========================================
// MIDDLEWARE
// ========================================

const { protect } = require("../middleware/auth");

const upload = require("../middleware/upload");

// ========================================
// PUBLIC ROUTES
// ========================================

// Register
router.post("/register", register);

// Login
router.post("/login", login);

// ========================================
// PROTECTED ROUTES
// ========================================

// Get current user
router.get("/me", protect, getMe);

// Update profile
router.put(
  "/profile",
  protect,
  updateProfile
);

// Upload profile image
router.post(
  "/profile/image",
  protect,
  upload.single("profileImage"),
  uploadProfileImage
);

// Change password
router.put(
  "/change-password",
  protect,
  changePassword
);

// ========================================
// EXPORT ROUTER
// ========================================

module.exports = router;