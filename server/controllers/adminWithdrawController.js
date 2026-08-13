const Withdraw = require("../models/Withdraw");
const User = require("../models/User");
const Notification = require("../models/notification.model");

// ========================================
// GET ALL WITHDRAW REQUESTS
// ========================================

const getAllWithdraws = async (req, res) => {
  try {
    const withdraws = await Withdraw.find()
      .populate(
        "user",
        "userId fullName email phone"
      )
      .sort({
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,
      count: withdraws.length,
      withdraws,
    });

  } catch (error) {
    console.error(
      "Get All Withdraws Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


// ========================================
// GET PENDING WITHDRAW REQUESTS
// ========================================

const getPendingWithdraws = async (req, res) => {
  try {
    const withdraws = await Withdraw.find({
      status: "Pending",
    })
      .populate(
        "user",
        "userId fullName email phone"
      )
      .sort({
        createdAt: 1,
      });

    return res.status(200).json({
      success: true,
      count: withdraws.length,
      withdraws,
    });

  } catch (error) {
    console.error(
      "Get Pending Withdraws Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


// ========================================
// GET SINGLE WITHDRAW REQUEST
// ========================================

const getWithdrawById = async (req, res) => {
  try {
    const { id } = req.params;

    const withdraw =
      await Withdraw.findById(id)
        .populate(
          "user",
          "userId fullName email phone"
        );

    if (!withdraw) {
      return res.status(404).json({
        success: false,
        message:
          "Withdraw request not found",
      });
    }

    return res.status(200).json({
      success: true,
      withdraw,
    });

  } catch (error) {
    console.error(
      "Get Withdraw Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


// ========================================
// APPROVE WITHDRAW
// ========================================

const approveWithdraw = async (req, res) => {
  try {
    const { id } = req.params;

    const withdraw =
      await Withdraw.findById(id);

    if (!withdraw) {
      return res.status(404).json({
        success: false,
        message:
          "Withdraw request not found",
      });
    }

    // ========================================
    // ONLY PENDING CAN BE APPROVED
    // ========================================

    if (
      withdraw.status !==
      "Pending"
    ) {
      return res.status(400).json({
        success: false,
        message:
          `Withdraw is already ${withdraw.status}`,
      });
    }

    // ========================================
    // GET USER
    // ========================================

    const user =
      await User.findById(
        withdraw.user
      );

    if (!user) {
      return res.status(404).json({
        success: false,
        message:
          "User not found",
      });
    }

    // ========================================
    // APPROVE
    // ========================================
    //
    // IMPORTANT:
    // Amount was already deducted/reserved
    // from EARNING when withdraw request
    // was created.
    //
    // DO NOT deduct earning again here.
    // ========================================

    withdraw.status =
      "Approved";

    if (
      req.body &&
      req.body.adminNote
    ) {
      withdraw.adminNote =
        String(
          req.body.adminNote
        ).trim();
    }

    await withdraw.save();

    // ========================================
    // SEND USER NOTIFICATION
    // ========================================

    try {
      await Notification.create({
        user:
          user._id,

        type:
          "success",

        title:
          "Withdrawal Approved",

        message:
          `Your withdrawal request of ${withdraw.amount} ${withdraw.currency || ""} has been approved successfully.`,

        link:
          "/dashboard/withdraw",

        isRead:
          false,

        data: {
          withdrawId:
            withdraw._id,

          amount:
            withdraw.amount,

          currency:
            withdraw.currency || "",

          status:
            "Approved",
        },
      });

    } catch (notificationError) {
      console.error(
        "Approve Withdraw Notification Error:",
        notificationError
      );

      // Notification fail হলেও
      // withdrawal approval fail হবে না.
    }

    return res.status(200).json({
      success: true,

      message:
        "Withdraw request approved successfully",

      withdraw,
    });

  } catch (error) {
    console.error(
      "Approve Withdraw Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error",
    });
  }
};


// ========================================
// REJECT WITHDRAW
// ========================================

const rejectWithdraw = async (req, res) => {
  try {
    const { id } = req.params;

    const withdraw =
      await Withdraw.findById(id);

    if (!withdraw) {
      return res.status(404).json({
        success: false,
        message:
          "Withdraw request not found",
      });
    }

    // ========================================
    // ONLY PENDING CAN BE REJECTED
    // ========================================

    if (
      withdraw.status !==
      "Pending"
    ) {
      return res.status(400).json({
        success: false,
        message:
          `Withdraw is already ${withdraw.status}`,
      });
    }

    // ========================================
    // GET USER
    // ========================================

    const user =
      await User.findById(
        withdraw.user
      );

    if (!user) {
      return res.status(404).json({
        success: false,
        message:
          "User not found",
      });
    }

    // ========================================
    // REFUND WITHDRAW AMOUNT TO EARNING
    // ========================================
    //
    // Withdraw request করার সময় amount
    // EARNING থেকে deduct করা হয়েছে।
    //
    // তাই Reject হলে সেই amount আবার
    // EARNING balance-এ ফেরত যাবে।
    //
    // 7% fee rejection-এর ক্ষেত্রে
    // charge হবে না।
    // ========================================

    const currentEarning =
      Number(
        user.earning || 0
      );

    const refundAmount =
      Number(
        withdraw.amount || 0
      );

    user.earning =
      Number(
        (
          currentEarning +
          refundAmount
        ).toFixed(2)
      );

    await user.save();

    // ========================================
    // REJECT
    // ========================================

    withdraw.status =
      "Rejected";

    if (
      req.body &&
      req.body.adminNote
    ) {
      withdraw.adminNote =
        String(
          req.body.adminNote
        ).trim();
    }

    await withdraw.save();

    // ========================================
    // SEND USER NOTIFICATION
    // ========================================

    try {
      const adminReason =
        req.body &&
        req.body.adminNote
          ? ` Reason: ${String(
              req.body.adminNote
            ).trim()}`
          : "";

      await Notification.create({
        user:
          user._id,

        type:
          "error",

        title:
          "Withdrawal Rejected",

        message:
          `Your withdrawal request of ${withdraw.amount} ${withdraw.currency || ""} has been rejected. The amount has been refunded to your earning balance.${adminReason}`,

        link:
          "/dashboard/withdraw",

        isRead:
          false,

        data: {
          withdrawId:
            withdraw._id,

          amount:
            withdraw.amount,

          currency:
            withdraw.currency || "",

          status:
            "Rejected",

          refundedAmount:
            refundAmount,
        },
      });

    } catch (notificationError) {
      console.error(
        "Reject Withdraw Notification Error:",
        notificationError
      );

      // Notification fail হলেও
      // rejection/refund fail হবে না.
    }

    return res.status(200).json({
      success: true,

      message:
        "Withdraw request rejected and amount refunded to earning balance",

      withdraw,

      earning:
        user.earning,

      refundedAmount:
        refundAmount,
    });

  } catch (error) {
    console.error(
      "Reject Withdraw Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error",
    });
  }
};


// ========================================
// EXPORT
// ========================================

module.exports = {
  getAllWithdraws,
  getPendingWithdraws,
  getWithdrawById,
  approveWithdraw,
  rejectWithdraw,
};