const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    // ==========================================
    // USER WHO RECEIVES THE NOTIFICATION
    // ==========================================

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // ==========================================
    // NOTIFICATION TYPE
    // ==========================================

    type: {
      type: String,
      default: "general",
      trim: true,
    },

    // ==========================================
    // TITLE
    // ==========================================

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    // ==========================================
    // MESSAGE
    // ==========================================

    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },

    // ==========================================
    // OPTIONAL LINK
    // ==========================================

    link: {
      type: String,
      default: "",
      trim: true,
    },

    // ==========================================
    // READ STATUS
    // ==========================================

    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },

    // ==========================================
    // OPTIONAL DATA
    // ==========================================

    data: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// ==========================================
// INDEXES
// ==========================================

notificationSchema.index({
  user: 1,
  createdAt: -1,
});

notificationSchema.index({
  user: 1,
  isRead: 1,
});

// ==========================================
// MODEL
// ==========================================

// IMPORTANT:
// Prevent Mongoose OverwriteModelError
// when the model has already been compiled.

const Notification =
  mongoose.models.Notification ||
  mongoose.model(
    "Notification",
    notificationSchema
  );

module.exports = Notification;