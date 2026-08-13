const Deposit = require("../models/Deposit");
const User = require("../models/User");
const Notification = require("../models/notification.model");

// =====================================================
// ADMIN CHECK
// =====================================================

const checkAdmin = (req, res) => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: "Not authorized.",
    });

    return false;
  }

  if (req.user.role !== "admin") {
    res.status(403).json({
      success: false,
      message: "Admin access required.",
    });

    return false;
  }

  return true;
};


// =====================================================
// GET PENDING DEPOSITS
// GET /api/admin/deposits/pending
// =====================================================

const getPendingDeposits = async (req, res) => {
  try {
    if (!checkAdmin(req, res)) {
      return;
    }

    const deposits = await Deposit.find({
      status: "pending",
    })
      .sort({
        createdAt: -1,
      })
      .populate(
        "user",
        "userId fullName email phone wallet deposit"
      );

    return res.status(200).json({
      success: true,
      count: deposits.length,
      deposits,
    });

  } catch (error) {
    console.error(
      "Get pending deposits error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to load pending deposits.",
    });
  }
};


// =====================================================
// GET ALL DEPOSITS
// GET /api/admin/deposits
// =====================================================

const getAllDeposits = async (req, res) => {
  try {
    if (!checkAdmin(req, res)) {
      return;
    }

    const deposits = await Deposit.find({})
      .sort({
        createdAt: -1,
      })
      .populate(
        "user",
        "userId fullName email phone wallet deposit"
      )
      .populate(
        "reviewedBy",
        "userId fullName email"
      );

    return res.status(200).json({
      success: true,
      count: deposits.length,
      deposits,
    });

  } catch (error) {
    console.error(
      "Get all deposits error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to load deposits.",
    });
  }
};


// =====================================================
// APPROVE DEPOSIT
// PATCH /api/admin/deposits/:id/approve
// =====================================================

const approveDeposit = async (req, res) => {
  try {

    // ---------------------------------------------------
    // ADMIN CHECK
    // ---------------------------------------------------

    if (!checkAdmin(req, res)) {
      return;
    }


    // ---------------------------------------------------
    // FIND DEPOSIT
    // ---------------------------------------------------

    const deposit =
      await Deposit.findById(
        req.params.id
      );

    if (!deposit) {
      return res.status(404).json({
        success: false,
        message:
          "Deposit not found.",
      });
    }


    // ---------------------------------------------------
    // PREVENT DOUBLE APPROVAL
    // ---------------------------------------------------

    if (
      deposit.status !== "pending"
    ) {
      return res.status(400).json({
        success: false,
        message:
          `This deposit is already ${deposit.status}.`,
      });
    }


    // ---------------------------------------------------
    // FIND USER
    // ---------------------------------------------------

    const user =
      await User.findById(
        deposit.user
      );

    if (!user) {
      return res.status(404).json({
        success: false,
        message:
          "Deposit owner not found.",
      });
    }


    // ---------------------------------------------------
    // GET NET USD
    // ---------------------------------------------------

    const netUsd =
      Number(
        deposit.netUsd
      );

    if (
      !Number.isFinite(netUsd) ||
      netUsd <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid deposit amount.",
      });
    }


    // ---------------------------------------------------
    // CURRENT BALANCES
    // ---------------------------------------------------

    const currentWallet =
      Number(
        user.wallet || 0
      );

    const currentDeposit =
      Number(
        user.deposit || 0
      );


    if (
      !Number.isFinite(currentWallet) ||
      !Number.isFinite(currentDeposit)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "User balance data is invalid.",
      });
    }


    // ---------------------------------------------------
    // NEW BALANCES
    // ---------------------------------------------------

    const newWallet =
      Number(
        (
          currentWallet +
          netUsd
        ).toFixed(2)
      );

    const newDeposit =
      Number(
        (
          currentDeposit +
          netUsd
        ).toFixed(2)
      );


    // ---------------------------------------------------
    // UPDATE USER BALANCES
    // ---------------------------------------------------
    //
    // Deposit approve হলে:
    //
    // wallet  += netUsd
    // deposit += netUsd
    //
    // ---------------------------------------------------

    const balanceUpdate =
      await User.updateOne(
        {
          _id: user._id,
        },
        {
          $set: {
            wallet:
              newWallet,

            deposit:
              newDeposit,
          },
        }
      );

    if (
      balanceUpdate.matchedCount !== 1
    ) {
      return res.status(404).json({
        success: false,
        message:
          "User balance update failed.",
      });
    }


    // ---------------------------------------------------
    // UPDATE DEPOSIT
    // ---------------------------------------------------

    deposit.status =
      "approved";

    deposit.reviewedBy =
      req.user._id;

    deposit.reviewedAt =
      new Date();

    deposit.adminNote =
      req.body &&
      req.body.adminNote
        ? String(
            req.body.adminNote
          ).trim()
        : "";

    await deposit.save();


    // ---------------------------------------------------
    // SEND USER NOTIFICATION
    // ---------------------------------------------------

    try {
      await Notification.create({
        user:
          user._id,

        type:
          "success",

        title:
          "Deposit Approved",

        message:
          `Your deposit of $${netUsd.toFixed(
            2
          )} has been approved and added to your wallet and deposit balance.`,

        link:
          "/notifications",

        isRead:
          false,

        data: {
          depositId:
            deposit._id,

          amount:
            netUsd,

          status:
            "approved",

          wallet:
            newWallet,

          depositTotal:
            newDeposit,
        },
      });

    } catch (notificationError) {
      console.error(
        "Approve deposit notification error:",
        notificationError
      );

      // Notification fail হলেও
      // deposit approval successful থাকবে.
    }


    // ---------------------------------------------------
    // GET UPDATED USER
    // ---------------------------------------------------

    const updatedUser =
      await User.findById(
        user._id
      );


    // ---------------------------------------------------
    // SUCCESS RESPONSE
    // ---------------------------------------------------

    return res.status(200).json({
      success: true,

      message:
        "Deposit approved successfully.",

      deposit: {
        id:
          deposit._id,

        status:
          deposit.status,

        netUsd:
          Number(
            deposit.netUsd
          ).toFixed(2),

        reviewedAt:
          deposit.reviewedAt,
      },

      user: {
        id:
          updatedUser
            ? updatedUser._id
            : user._id,

        userId:
          updatedUser
            ? updatedUser.userId
            : user.userId,

        fullName:
          updatedUser
            ? updatedUser.fullName
            : user.fullName,

        wallet:
          updatedUser
            ? Number(
                updatedUser.wallet
              ).toFixed(2)
            : newWallet,

        deposit:
          updatedUser
            ? Number(
                updatedUser.deposit
              ).toFixed(2)
            : newDeposit,
      },
    });

  } catch (error) {
    console.error(
      "Approve deposit error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to approve deposit.",
    });
  }
};


// =====================================================
// REJECT DEPOSIT
// PATCH /api/admin/deposits/:id/reject
// =====================================================

const rejectDeposit = async (req, res) => {
  try {

    // ---------------------------------------------------
    // ADMIN CHECK
    // ---------------------------------------------------

    if (!checkAdmin(req, res)) {
      return;
    }


    // ---------------------------------------------------
    // FIND DEPOSIT
    // ---------------------------------------------------

    const deposit =
      await Deposit.findById(
        req.params.id
      );

    if (!deposit) {
      return res.status(404).json({
        success: false,
        message:
          "Deposit not found.",
      });
    }


    // ---------------------------------------------------
    // ONLY PENDING CAN BE REJECTED
    // ---------------------------------------------------

    if (
      deposit.status !== "pending"
    ) {
      return res.status(400).json({
        success: false,
        message:
          `This deposit is already ${deposit.status}.`,
      });
    }


    // ---------------------------------------------------
    // FIND USER
    // ---------------------------------------------------

    const user =
      await User.findById(
        deposit.user
      );

    if (!user) {
      return res.status(404).json({
        success: false,
        message:
          "Deposit owner not found.",
      });
    }


    // ---------------------------------------------------
    // REJECTION REASON
    // ---------------------------------------------------

    const rejectionReason =
      req.body &&
      (
        req.body.rejectionReason ||
        req.body.reason
      )
        ? String(
            req.body.rejectionReason ||
            req.body.reason
          ).trim()
        : "Deposit request rejected by admin.";


    // ---------------------------------------------------
    // UPDATE DEPOSIT
    // ---------------------------------------------------

    deposit.status =
      "rejected";

    deposit.reviewedBy =
      req.user._id;

    deposit.reviewedAt =
      new Date();

    deposit.rejectionReason =
      rejectionReason;

    deposit.adminNote =
      req.body &&
      req.body.adminNote
        ? String(
            req.body.adminNote
          ).trim()
        : "";

    await deposit.save();


    // ---------------------------------------------------
    // SEND USER NOTIFICATION
    // ---------------------------------------------------

    try {
      await Notification.create({
        user:
          user._id,

        type:
          "error",

        title:
          "Deposit Rejected",

        message:
          `Your deposit request of $${Number(
            deposit.netUsd || 0
          ).toFixed(
            2
          )} has been rejected. Reason: ${rejectionReason}`,

        link:
          "/notifications",

        isRead:
          false,

        data: {
          depositId:
            deposit._id,

          amount:
            Number(
              deposit.netUsd || 0
            ),

          status:
            "rejected",

          rejectionReason:
            rejectionReason,
        },
      });

    } catch (notificationError) {
      console.error(
        "Reject deposit notification error:",
        notificationError
      );

      // Notification fail হলেও
      // rejection successful থাকবে.
    }


    // ---------------------------------------------------
    // SUCCESS RESPONSE
    // ---------------------------------------------------

    return res.status(200).json({
      success: true,

      message:
        "Deposit rejected successfully.",

      deposit: {
        id:
          deposit._id,

        status:
          deposit.status,

        rejectionReason:
          deposit.rejectionReason,

        reviewedAt:
          deposit.reviewedAt,
      },
    });

  } catch (error) {
    console.error(
      "Reject deposit error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to reject deposit.",
    });
  }
};


// =====================================================
// GET SINGLE ADMIN DEPOSIT
// GET /api/admin/deposits/:id
// =====================================================

const getAdminDepositById = async (
  req,
  res
) => {
  try {

    if (!checkAdmin(req, res)) {
      return;
    }


    const deposit =
      await Deposit.findById(
        req.params.id
      )
        .populate(
          "user",
          "userId fullName email phone wallet deposit"
        )
        .populate(
          "reviewedBy",
          "userId fullName email"
        );


    if (!deposit) {
      return res.status(404).json({
        success: false,
        message:
          "Deposit not found.",
      });
    }


    return res.status(200).json({
      success: true,
      deposit,
    });

  } catch (error) {
    console.error(
      "Get admin deposit error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to load deposit.",
    });
  }
};


// =====================================================
// EXPORT
// =====================================================

module.exports = {
  getPendingDeposits,
  getAllDeposits,
  getAdminDepositById,
  approveDeposit,
  rejectDeposit,
};