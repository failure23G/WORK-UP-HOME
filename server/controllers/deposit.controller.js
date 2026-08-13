const Deposit = require("../models/Deposit");

// =====================================================
// CONSTANTS
// =====================================================

const EXCHANGE_RATE = 115;
const FEE_PERCENT = 7;

// =====================================================
// CREATE DEPOSIT
// POST /api/deposits
// multipart/form-data
// =====================================================

const createDeposit = async (req, res) => {
  try {
    const {
      method,
      bdtAmount,
      transactionId,
    } = req.body;

    // =================================================
    // VALIDATE METHOD
    // =================================================

    if (!method) {
      return res.status(400).json({
        success: false,
        message: "Payment method is required.",
      });
    }

    if (
      !["bkash", "nagad", "binance"].includes(
        method
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment method.",
      });
    }

    // =================================================
    // BINANCE CURRENTLY DISABLED
    // =================================================

    if (method === "binance") {
      return res.status(400).json({
        success: false,
        message: "Binance deposit is coming soon.",
      });
    }

    // =================================================
    // VALIDATE AMOUNT
    // =================================================

    const amount = Number(bdtAmount);

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid amount.",
      });
    }

    if (amount < EXCHANGE_RATE) {
      return res.status(400).json({
        success: false,
        message:
          "Minimum deposit is 115 BDT.",
      });
    }

    // =================================================
    // TRANSACTION ID
    // =================================================

    if (!transactionId) {
      return res.status(400).json({
        success: false,
        message:
          "Transaction ID is required.",
      });
    }

    // =================================================
    // PAYMENT SCREENSHOT
    // =================================================

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message:
          "Payment screenshot is required.",
      });
    }

    // =================================================
    // CALCULATE GROSS USD
    // =================================================

    const grossUsd =
      amount / EXCHANGE_RATE;

    // =================================================
    // CALCULATE 7% FEE
    // =================================================

    const feeUsd =
      grossUsd * (FEE_PERCENT / 100);

    // =================================================
    // NET USD
    // =================================================

    const netUsd =
      grossUsd - feeUsd;

    // =================================================
    // SCREENSHOT PATH
    // =================================================

    const paymentScreenshot =
      `/uploads/deposits/${req.file.filename}`;

    // =================================================
    // CREATE DEPOSIT
    // =================================================

    const deposit = await Deposit.create({
      user: req.user._id,

      method,

      bdtAmount: amount,

      exchangeRate: EXCHANGE_RATE,

      grossUsd,

      feePercent: FEE_PERCENT,

      feeUsd,

      netUsd,

      transactionId:
        transactionId.trim(),

      paymentScreenshot,

      status: "pending",
    });

    // =================================================
    // RESPONSE
    // =================================================

    return res.status(201).json({
      success: true,

      message:
        "Deposit request submitted successfully.",

      deposit: {
        id: deposit._id,

        method:
          deposit.method,

        bdtAmount:
          deposit.bdtAmount,

        exchangeRate:
          deposit.exchangeRate,

        grossUsd:
          Number(
            deposit.grossUsd
          ).toFixed(2),

        feePercent:
          deposit.feePercent,

        feeUsd:
          Number(
            deposit.feeUsd
          ).toFixed(2),

        netUsd:
          Number(
            deposit.netUsd
          ).toFixed(2),

        transactionId:
          deposit.transactionId,

        paymentScreenshot:
          deposit.paymentScreenshot,

        status:
          deposit.status,

        createdAt:
          deposit.createdAt,
      },
    });
  } catch (error) {
    console.error(
      "Create deposit error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to create deposit.",
    });
  }
};

// =====================================================
// GET MY DEPOSITS
// GET /api/deposits/my
// =====================================================

const getMyDeposits = async (
  req,
  res
) => {
  try {
    const deposits =
      await Deposit.find({
        user: req.user._id,
      })
        .sort({
          createdAt: -1,
        })
        .populate(
          "reviewedBy",
          "fullName email userId"
        );

    return res.status(200).json({
      success: true,

      count:
        deposits.length,

      deposits,
    });
  } catch (error) {
    console.error(
      "Get my deposits error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to load deposit history.",
    });
  }
};

// =====================================================
// GET SINGLE DEPOSIT
// GET /api/deposits/:id
// =====================================================

const getDepositById = async (
  req,
  res
) => {
  try {
    const deposit =
      await Deposit.findById(
        req.params.id
      ).populate(
        "user",
        "userId fullName email phone"
      );

    if (!deposit) {
      return res.status(404).json({
        success: false,
        message:
          "Deposit not found.",
      });
    }

    // =================================================
    // USER CAN ONLY VIEW OWN DEPOSIT
    // =================================================

    if (
      deposit.user._id.toString() !==
        req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You are not allowed to view this deposit.",
      });
    }

    return res.status(200).json({
      success: true,
      deposit,
    });
  } catch (error) {
    console.error(
      "Get deposit error:",
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
  createDeposit,
  getMyDeposits,
  getDepositById,
};