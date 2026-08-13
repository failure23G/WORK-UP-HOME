const express = require("express");

const router = express.Router();

const { protect } = require("../middleware/auth");

const {
  getDashboardStats,
} = require("../controllers/dashboard.controller");

// ==========================================
// GET DASHBOARD STATS
// GET /api/dashboard/stats
// Protected Route
// ==========================================

router.get(
  "/stats",
  protect,
  getDashboardStats
);

module.exports = router;