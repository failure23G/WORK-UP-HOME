const mongoose = require("mongoose");

const depositSchema = new mongoose.Schema(
  {
    // ==================================================
    // USER
    // ==================================================

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // ==================================================
    // PAYMENT METHOD
    // ==================================================

    method: {
      type: String,
      enum: ["bkash", "nagad", "binance"],
      required: true,
    },

    // ==================================================
    // BDT AMOUNT
    // ==================================================

    bdtAmount: {
      type: Number,
      required: true,
      min: 115,
    },

    // ==================================================
    // EXCHANGE RATE
    // $1 = 115 BDT
    // ==================================================

    exchangeRate: {
      type: Number,
      default: 115,
    },

    // ==================================================
    // GROSS USD
    // ==================================================

    grossUsd: {
      type: Number,
      required: true,
      min: 0,
    },

    // ==================================================
    // PROCESSING FEE
    // 7%
    // ==================================================

    feePercent: {
      type: Number,
      default: 7,
    },

    feeUsd: {
      type: Number,
      required: true,
      min: 0,
    },

    // ==================================================
    // NET USD
    // ==================================================

    netUsd: {
      type: Number,
      required: true,
      min: 0,
    },

    // ==================================================
    // TRANSACTION ID
    // ==================================================

    transactionId: {
      type: String,
      required: true,
      trim: true,
    },

    // ==================================================
    // PAYMENT SCREENSHOT
    // ==================================================

    paymentScreenshot: {
      type: String,
      required: true,
      trim: true,
    },

    // ==================================================
    // STATUS
    // ==================================================

    status: {
      type: String,
      enum: [
        "pending",
        "approved",
        "rejected",
      ],
      default: "pending",
      index: true,
    },

    // ==================================================
    // ADMIN REVIEW
    // ==================================================

    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    reviewedAt: {
      type: Date,
      default: null,
    },

    // ==================================================
    // REJECTION REASON
    // ==================================================

    rejectionReason: {
      type: String,
      default: "",
      trim: true,
    },

    // ==================================================
    // ADMIN NOTE
    // ==================================================

    adminNote: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Deposit",
  depositSchema
);