const Withdraw = require("../models/Withdraw");
const User = require("../models/User");

// ============================================================
// CONSTANTS
// ============================================================

const EXCHANGE_RATE = 115;
const FEE_PERCENT = 7;

const MIN_USD = 2;
const MAX_USD = 100;

// ============================================================
// GET ENUM VALUE
// ============================================================
// This keeps the controller compatible with the actual
// Withdraw model enum casing.
//
// Example:
// model may use:
// ["nagad", "bkash", "binance"]
//
// OR:
// ["Nagad", "bKash", "Binance"]
//
// The controller will automatically use the value
// supported by the model.
// ============================================================

const getEnumValue = (
  model,
  fieldName,
  requestedValue
) => {
  try {
    const schemaPath =
      model.schema?.path(fieldName);

    const enumValues =
      schemaPath?.enumValues || [];

    if (!enumValues.length) {
      return requestedValue;
    }

    const normalized =
      String(requestedValue)
        .trim()
        .toLowerCase();

    const matched =
      enumValues.find(
        (value) =>
          String(value)
            .trim()
            .toLowerCase() ===
          normalized
      );

    return matched || null;
  } catch (error) {
    console.error(
      `Enum lookup error for ${fieldName}:`,
      error
    );

    return requestedValue;
  }
};

// ============================================================
// CREATE WITHDRAW REQUEST
// ============================================================

const createWithdraw = async (
  req,
  res
) => {
  try {
    // ========================================================
    // USER ID
    // ========================================================

    const userId =
      req.user?.id ||
      req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message:
          "User authentication required",
      });
    }

    // ========================================================
    // REQUEST BODY
    // ========================================================

    const {
      method,
      account,
      amount,
    } = req.body || {};

    // ========================================================
    // METHOD
    // ========================================================

    const rawMethod =
      String(method || "")
        .trim()
        .toLowerCase();

    const allowedMethods = [
      "nagad",
      "bkash",
      "binance",
    ];

    if (
      !allowedMethods.includes(
        rawMethod
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid withdraw method",
      });
    }

    // ========================================================
    // MATCH ACTUAL MODEL ENUM
    // ========================================================

    const withdrawMethod =
      getEnumValue(
        Withdraw,
        "method",
        rawMethod
      );

    if (!withdrawMethod) {
      return res.status(400).json({
        success: false,
        message:
          "Withdraw method is not supported by the server",
      });
    }

    // ========================================================
    // ACCOUNT
    // ========================================================

    const cleanAccount =
      String(account || "").trim();

    if (!cleanAccount) {
      return res.status(400).json({
        success: false,
        message:
          "Payment account is required",
      });
    }

    // ========================================================
    // AMOUNT
    // ========================================================

    const withdrawAmount =
      Number(amount);

    if (
      !Number.isFinite(
        withdrawAmount
      ) ||
      withdrawAmount <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid withdraw amount",
      });
    }

    // ========================================================
    // MINIMUM
    // ========================================================

    if (
      withdrawAmount < MIN_USD
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Minimum withdraw amount is $2 USDT",
      });
    }

    // ========================================================
    // MAXIMUM
    // ========================================================

    if (
      withdrawAmount > MAX_USD
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Maximum withdraw amount is $100 USDT",
      });
    }

    // ========================================================
    // ROUND
    // ========================================================

    const finalAmount =
      Number(
        withdrawAmount.toFixed(2)
      );

    // ========================================================
    // USER
    // ========================================================

    const user =
      await User.findById(
        userId
      );

    if (!user) {
      return res.status(404).json({
        success: false,
        message:
          "User not found",
      });
    }

    // ========================================================
// EARNING BALANCE
// ========================================================

const earningBalance =
  Number(
    user.earning || 0
  );

if (
  !Number.isFinite(
    earningBalance
  )
) {
  return res.status(400).json({
    success: false,
    message:
      "Invalid earning balance",
  });
}
    // ========================================================
    // INSUFFICIENT BALANCE
    // ========================================================

   if (
  earningBalance <
  finalAmount
) {
  return res.status(400).json({
    success: false,
    message:
      "Insufficient earning balance",
  });
}

    // ========================================================
    // 7% FEE
    // ========================================================

    const fee =
      Number(
        (
          finalAmount *
          (FEE_PERCENT / 100)
        ).toFixed(2)
      );

    // ========================================================
    // USER RECEIVE
    // ========================================================

    const receiveAmount =
      Number(
        (
          finalAmount -
          fee
        ).toFixed(2)
      );

    // ========================================================
    // BDT CALCULATIONS
    // ========================================================

    const bdtAmount =
      Number(
        (
          finalAmount *
          EXCHANGE_RATE
        ).toFixed(2)
      );

    const feeBdt =
      Number(
        (
          fee *
          EXCHANGE_RATE
        ).toFixed(2)
      );

    const receiveBdt =
      Number(
        (
          receiveAmount *
          EXCHANGE_RATE
        ).toFixed(2)
      );

    // ========================================================
    // STATUS
    // ========================================================
    //
    // Automatically use the status enum from the actual model.
    //
    // ========================================================

    const withdrawStatus =
      getEnumValue(
        Withdraw,
        "status",
        "pending"
      );

    if (!withdrawStatus) {
      return res.status(500).json({
        success: false,
        message:
          "Withdraw status configuration is invalid",
      });
    }

    // ========================================================
    // CREATE DATA
    // ========================================================

    const withdrawData = {
      // Basic
      user: userId,

      method:
        withdrawMethod,

      account:
        cleanAccount,

      // Main USD amount
      amount:
        finalAmount,

      // Fee
      fee:
        fee,

      // User receive amount
      receiveAmount:
        receiveAmount,

      // Status
      status:
        withdrawStatus,

      // ======================================================
      // Additional calculation fields
      // ======================================================
      //
      // If these fields exist in the model,
      // they will be saved.
      //
      // If they do not exist and strict mode is enabled,
      // Mongoose will simply ignore them.
      //
      // ======================================================

      exchangeRate:
        EXCHANGE_RATE,

      feePercent:
        FEE_PERCENT,

      bdtAmount:
        bdtAmount,

      feeBdt:
        feeBdt,

      receiveBdt:
        receiveBdt,

      grossUsd:
        finalAmount,

      feeUsd:
        fee,

      netUsd:
        receiveAmount,
    };

    // ========================================================
    // CREATE WITHDRAW
    // ========================================================

    const withdraw =
      await Withdraw.create(
        withdrawData
      );

    // ========================================================
// DEDUCT USER EARNING
// ========================================================

user.earning =
  Number(
    (
      earningBalance -
      finalAmount
    ).toFixed(2)
  );

await user.save();
    // ========================================================

    user.wallet =
      Number(
        (
          walletBalance -
          finalAmount
        ).toFixed(2)
      );

    await user.save();

    // ========================================================
    // RESPONSE
    // ========================================================

    return res.status(201).json({
      success: true,

      message:
        "Withdraw request submitted successfully",

      withdraw:

        withdraw,

      earning:
         user.earning,
        

      calculation: {
        usdAmount:
          finalAmount,

        bdtAmount:
          bdtAmount,

        exchangeRate:
          EXCHANGE_RATE,

        feePercent:
          FEE_PERCENT,

        feeUsd:
          fee,

        feeBdt:
          feeBdt,

        receiveUsd:
          receiveAmount,

        receiveBdt:
          receiveBdt,
      },
    });

  } catch (error) {

    // ========================================================
    // SERVER ERROR
    // ========================================================

    console.error(
      "========================================"
    );

    console.error(
      "CREATE WITHDRAW ERROR"
    );

    console.error(
      error
    );

    console.error(
      "========================================"
    );

    // Show useful validation information
    // instead of only "Server error".
    const errorMessage =
      error?.message ||
      "Server error";

    return res.status(500).json({
      success: false,

      message:
        errorMessage,
    });
  }
};

// ============================================================
// GET MY WITHDRAW HISTORY
// ============================================================

const getMyWithdraws =
  async (
    req,
    res
  ) => {
    try {

      const userId =
        req.user?.id ||
        req.user?._id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message:
            "User authentication required",
        });
      }

      const withdraws =
        await Withdraw.find({
          user: userId,
        }).sort({
          createdAt: -1,
        });

      return res.status(200).json({
        success: true,

        withdraws:
          withdraws,
      });

    } catch (error) {

      console.error(
        "GET MY WITHDRAWS ERROR:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          error?.message ||
          "Server error",
      });
    }
  };

// ============================================================
// EXPORT
// ============================================================

module.exports = {
  createWithdraw,
  getMyWithdraws,
};