const express = require("express");

const {
  getAllWithdraws,
  getPendingWithdraws,
  getWithdrawById,
  approveWithdraw,
  rejectWithdraw,
} = require("../controllers/adminWithdrawController");

const { protect } = require("../middleware/auth");
const { admin } = require("../middleware/admin");

const router = express.Router();

// ========================================
// ADMIN WITHDRAW ROUTES
// ========================================

// Get all withdraw requests
router.get(
  "/",
  protect,
  admin,
  getAllWithdraws
);

// Get pending withdraw requests
router.get(
  "/pending",
  protect,
  admin,
  getPendingWithdraws
);

// Get single withdraw request
router.get(
  "/:id",
  protect,
  admin,
  getWithdrawById
);

// Approve withdraw
router.patch(
  "/:id/approve",
  protect,
  admin,
  approveWithdraw
);

// Reject withdraw
router.patch(
  "/:id/reject",
  protect,
  admin,
  rejectWithdraw
);

module.exports = router;