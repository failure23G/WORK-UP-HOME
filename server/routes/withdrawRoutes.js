const express = require("express");

const {
  createWithdraw,
  getMyWithdraws,
} = require("../controllers/withdrawController");

const { protect } = require("../middleware/auth");

const router = express.Router();

// ========================================
// USER WITHDRAW
// ========================================

// Create withdraw request
router.post("/", protect, createWithdraw);

// Get my withdraw history
router.get("/my", protect, getMyWithdraws);

module.exports = router;