const express = require("express");

const router = express.Router();

// =====================================================
// CONTROLLER
// =====================================================

const {
  getPendingDeposits,
  getAllDeposits,
  getAdminDepositById,
  approveDeposit,
  rejectDeposit,
} = require("../controllers/admin.deposit.controller");

// =====================================================
// AUTH
// =====================================================

const { protect } = require("../middleware/auth");

// =====================================================
// PENDING DEPOSITS
// GET /api/admin/deposits/pending
// =====================================================

router.get(
  "/pending",
  protect,
  getPendingDeposits
);

// =====================================================
// ALL DEPOSITS
// GET /api/admin/deposits
// =====================================================

router.get(
  "/",
  protect,
  getAllDeposits
);

// =====================================================
// SINGLE DEPOSIT
// GET /api/admin/deposits/:id
// =====================================================

router.get(
  "/:id",
  protect,
  getAdminDepositById
);

// =====================================================
// APPROVE DEPOSIT
// PATCH /api/admin/deposits/:id/approve
// =====================================================

router.patch(
  "/:id/approve",
  protect,
  approveDeposit
);

// =====================================================
// REJECT DEPOSIT
// PATCH /api/admin/deposits/:id/reject
// =====================================================

router.patch(
  "/:id/reject",
  protect,
  rejectDeposit
);

// =====================================================
// EXPORT
// =====================================================

module.exports = router;