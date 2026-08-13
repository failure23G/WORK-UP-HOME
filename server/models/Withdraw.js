const mongoose = require("mongoose");

// ========================================
// WITHDRAW SCHEMA
// ========================================

const withdrawSchema = new mongoose.Schema(
  {
    // ======================================
    // USER
    // ======================================

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // ======================================
    // PAYMENT METHOD
    // ======================================

    method: {
      type: String,
      enum: [
        "Nagad",
        "bKash",
        "Binance",
      ],
      required: true,
    },

    // ======================================
    // PAYMENT ACCOUNT
    // ======================================

    account: {
      type: String,
      required: true,
      trim: true,
    },

    // ======================================
    // WITHDRAW AMOUNT
    // ======================================
    //
    // Amount is stored in USD / USDT.
    //
    // Minimum:
    // $2 USDT
    //
    // Maximum:
    // $100 USDT
    //
    // Exchange rate:
    // $1 = ৳115
    //
    // Therefore:
    // $2   = ৳230
    // $100 = ৳11,500
    //
    // ======================================

    amount: {
      type: Number,
      required: true,
      min: 2,
      max: 100,
    },

    // ======================================
    // 7% FEE
    // ======================================

    fee: {
      type: Number,
      required: true,
      min: 0,
    },

    // ======================================
    // USER RECEIVES
    // ======================================
    //
    // amount - fee
    //
    // Example:
    // $10 - $0.70 = $9.30
    //
    // ======================================

    receiveAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    // ======================================
    // STATUS
    // ======================================

    status: {
      type: String,
      enum: [
        "Pending",
        "Approved",
        "Rejected",
      ],
      default: "Pending",
      index: true,
    },

    // ======================================
    // ADMIN NOTE
    // ======================================

    adminNote: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// ========================================
// INDEXES
// ========================================

withdrawSchema.index({
  user: 1,
  createdAt: -1,
});

withdrawSchema.index({
  status: 1,
  createdAt: -1,
});

// ========================================
// MODEL
// ========================================

const Withdraw = mongoose.model(
  "Withdraw",
  withdrawSchema
);

// ========================================
// EXPORT
// ========================================

module.exports = Withdraw;