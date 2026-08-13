const User = require("../models/User");

// ============================================================
// ADMIN CHECK
// ============================================================

const checkAdmin = (req, res) => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: "Authentication required",
    });

    return false;
  }

  if (req.user.role !== "admin") {
    res.status(403).json({
      success: false,
      message: "Admin access required",
    });

    return false;
  }

  return true;
};

// ============================================================
// GET ALL USERS
// GET /api/admin/users
// ============================================================

const getAllUsers = async (req, res) => {
  try {
    if (!checkAdmin(req, res)) {
      return;
    }

    const users = await User.find({
      role: {
        $ne: "admin",
      },
    })
      .select("-password")
      .sort({
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    console.error("Admin get users error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load users",
    });
  }
};

// ============================================================
// GET SINGLE USER
// GET /api/admin/users/:id
// ============================================================

const getSingleUser = async (req, res) => {
  try {
    if (!checkAdmin(req, res)) {
      return;
    }

    const user = await User.findById(req.params.id).select(
      "-password"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Admin get single user error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load user",
    });
  }
};

// ============================================================
// MANAGE USER BALANCE
//
// POST /api/admin/users/:id/manage-balance
//
// Body:
//
// {
//   "balanceType": "wallet",
//   "action": "add",
//   "amount": 10
// }
//
// balanceType:
// wallet
// deposit
// earning
//
// action:
// add
// deduct
// ============================================================

const manageUserBalance = async (req, res) => {
  try {
    // ----------------------------------------------------------
    // ADMIN CHECK
    // ----------------------------------------------------------

    if (!checkAdmin(req, res)) {
      return;
    }

    // ----------------------------------------------------------
    // GET USER
    // ----------------------------------------------------------

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // ----------------------------------------------------------
    // PREVENT ADMIN BALANCE CHANGE
    // ----------------------------------------------------------

    if (String(user.role).toLowerCase() === "admin") {
      return res.status(403).json({
        success: false,
        message:
          "Admin balance cannot be changed from this panel",
      });
    }

    // ----------------------------------------------------------
    // REQUEST DATA
    // ----------------------------------------------------------

    const {
      balanceType,
      action,
      amount,
      note,
    } = req.body || {};

    // ----------------------------------------------------------
    // VALID BALANCE TYPE
    // ----------------------------------------------------------

    const allowedBalanceTypes = [
      "wallet",
      "deposit",
      "earning",
    ];

    if (!allowedBalanceTypes.includes(balanceType)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid balance type. Use wallet, deposit or earning.",
      });
    }

    // ----------------------------------------------------------
    // VALID ACTION
    // ----------------------------------------------------------

    const allowedActions = [
      "add",
      "deduct",
    ];

    if (!allowedActions.includes(action)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid action. Use add or deduct.",
      });
    }

    // ----------------------------------------------------------
    // VALID AMOUNT
    // ----------------------------------------------------------

    const numericAmount = Number(amount);

    if (
      !Number.isFinite(numericAmount) ||
      numericAmount <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Amount must be greater than 0.",
      });
    }

    // ----------------------------------------------------------
    // ROUND AMOUNT
    // ----------------------------------------------------------

    const changeAmount = Number(
      numericAmount.toFixed(2)
    );

    // ----------------------------------------------------------
    // CURRENT BALANCE
    // ----------------------------------------------------------

    const currentBalance = Number(
      user[balanceType] || 0
    );

    if (!Number.isFinite(currentBalance)) {
      return res.status(400).json({
        success: false,
        message:
          `User ${balanceType} balance is invalid.`,
      });
    }

    // ----------------------------------------------------------
    // CALCULATE NEW BALANCE
    // ----------------------------------------------------------

    let newBalance;

    if (action === "add") {
      newBalance = Number(
        (
          currentBalance +
          changeAmount
        ).toFixed(2)
      );
    }

    if (action === "deduct") {
      if (currentBalance < changeAmount) {
        return res.status(400).json({
          success: false,
          message:
            `Insufficient ${balanceType} balance.`,
          currentBalance:
            Number(
              currentBalance.toFixed(2)
            ),
          requestedAmount:
            changeAmount,
        });
      }

      newBalance = Number(
        (
          currentBalance -
          changeAmount
        ).toFixed(2)
      );
    }

    // ----------------------------------------------------------
    // UPDATE BALANCE
    //
    // IMPORTANT:
    // Do NOT use user.save() here.
    // Direct MongoDB update avoids unrelated
    // User model validation errors.
    // ----------------------------------------------------------

    const updatedUser =
      await User.findByIdAndUpdate(
        req.params.id,
        {
          $set: {
            [balanceType]: newBalance,
          },
        },
        {
          new: true,
          runValidators: false,
        }
      ).select("-password");

    // ----------------------------------------------------------
    // CHECK UPDATE
    // ----------------------------------------------------------

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found while updating balance.",
      });
    }

    // ----------------------------------------------------------
    // UPDATED BALANCES
    // ----------------------------------------------------------

    const updatedBalances = {
      wallet: Number(
        updatedUser.wallet || 0
      ).toFixed(2),

      deposit: Number(
        updatedUser.deposit || 0
      ).toFixed(2),

      earning: Number(
        updatedUser.earning || 0
      ).toFixed(2),
    };

    // ----------------------------------------------------------
    // SUCCESS RESPONSE
    // ----------------------------------------------------------

    return res.status(200).json({
      success: true,

      message:
        `${balanceType} balance ${action}ed successfully.`,

      user: {
        id: updatedUser._id,

        userId:
          updatedUser.userId,

        fullName:
          updatedUser.fullName,

        email:
          updatedUser.email,

        wallet:
          updatedBalances.wallet,

        deposit:
          updatedBalances.deposit,

        earning:
          updatedBalances.earning,
      },

      transaction: {
        balanceType,

        action,

        amount:
          changeAmount,

        note:
          note
            ? String(note).trim()
            : "",

        previousBalance:
          Number(
            currentBalance.toFixed(2)
          ),

        newBalance:
          Number(
            updatedUser[balanceType] || 0
          ).toFixed(2),

        admin:
          req.user._id,

        createdAt:
          new Date(),
      },
    });
  } catch (error) {
    // ----------------------------------------------------------
    // REAL ERROR LOG
    // ----------------------------------------------------------

    console.error(
      "Admin manage balance error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        error?.message ||
        "Failed to update user balance",

      error:
        process.env.NODE_ENV === "production"
          ? undefined
          : error?.message,
    });
  }
};

// ============================================================
// EXPORT
// ============================================================

module.exports = {
  getAllUsers,
  getSingleUser,
  manageUserBalance,
};