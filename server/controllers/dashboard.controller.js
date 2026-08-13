const User = require("../models/User");

// ==========================================
// GET DASHBOARD STATS
// GET /api/dashboard/stats
// Protected Route
// ==========================================

const getDashboardStats = async (req, res, next) => {
  try {
    // Logged-in user's ID
    const userId = req.user.id;

    // Find user and load wallet
    const user = await User.findById(userId)
      .populate("wallet")
      .select("wallet");

    // User not found
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // Get real wallet balance
    const balance =
      Number(user.wallet?.balance) || 0;

    // Jobs / projects / messages are not connected
    // to dashboard stats yet, so keep them at 0.
    return res.status(200).json({
      success: true,

      data: {
        balance: balance,

        totalProjects: 0,

        messages: 0,

        completedJobs: 0,
      },
    });
  } catch (error) {
    console.error(
      "Dashboard Stats Error:",
      error
    );

    next(error);
  }
};

module.exports = {
  getDashboardStats,
};