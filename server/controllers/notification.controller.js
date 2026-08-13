const mongoose = require("mongoose");

const Notification = require("../models/notification.model");
const User = require("../models/User");

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

  if (
    String(req.user.role || "").toLowerCase() !==
    "admin"
  ) {
    res.status(403).json({
      success: false,
      message: "Admin access required.",
    });

    return false;
  }

  return true;
};

// =====================================================
// USER NOTIFICATIONS
// GET /api/notifications
// =====================================================

const getMyNotifications = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authorized.",
      });
    }

    const notifications = await Notification.find({
      user: req.user._id,
    })
      .sort({
        createdAt: -1,
      })
      .limit(100);

    const unreadCount = await Notification.countDocuments({
      user: req.user._id,
      isRead: false,
    });

    return res.status(200).json({
      success: true,
      count: notifications.length,
      unreadCount,
      notifications,
    });
  } catch (error) {
    console.error(
      "Get notifications error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to load notifications.",
    });
  }
};

// =====================================================
// MARK ONE NOTIFICATION AS READ
// PATCH /api/notifications/:id/read
// =====================================================

const markNotificationRead = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authorized.",
      });
    }

    if (
      !mongoose.Types.ObjectId.isValid(
        req.params.id
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid notification ID.",
      });
    }

    const notification =
      await Notification.findOne({
        _id: req.params.id,
        user: req.user._id,
      });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found.",
      });
    }

    notification.isRead = true;

    await notification.save();

    return res.status(200).json({
      success: true,
      message: "Notification marked as read.",
      notification,
    });
  } catch (error) {
    console.error(
      "Mark notification read error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to update notification.",
    });
  }
};

// =====================================================
// MARK ALL NOTIFICATIONS AS READ
// PATCH /api/notifications/read-all
// =====================================================

const markAllNotificationsRead = async (
  req,
  res
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authorized.",
      });
    }

    await Notification.updateMany(
      {
        user: req.user._id,
        isRead: false,
      },
      {
        $set: {
          isRead: true,
        },
      }
    );

    return res.status(200).json({
      success: true,
      message: "All notifications marked as read.",
    });
  } catch (error) {
    console.error(
      "Mark all notifications read error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to update notifications.",
    });
  }
};

// =====================================================
// DELETE ONE USER NOTIFICATION
// DELETE /api/notifications/:id
// =====================================================

const deleteMyNotification = async (
  req,
  res
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authorized.",
      });
    }

    if (
      !mongoose.Types.ObjectId.isValid(
        req.params.id
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid notification ID.",
      });
    }

    const deleted =
      await Notification.findOneAndDelete({
        _id: req.params.id,
        user: req.user._id,
      });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Notification not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Notification deleted.",
    });
  } catch (error) {
    console.error(
      "Delete notification error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to delete notification.",
    });
  }
};

// =====================================================
// ADMIN - GET USERS
// GET /api/notifications/admin/users
// =====================================================

const getNotificationUsers = async (
  req,
  res
) => {
  try {
    if (!checkAdmin(req, res)) {
      return;
    }

    const users = await User.find({
      role: {
        $ne: "admin",
      },
    })
      .select(
        "_id userId fullName email phone"
      )
      .sort({
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    console.error(
      "Get notification users error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to load users.",
    });
  }
};

// =====================================================
// ADMIN - GET ALL SENT NOTIFICATIONS
// GET /api/notifications/admin/all
// =====================================================

const getAllAdminNotifications = async (
  req,
  res
) => {
  try {
    if (!checkAdmin(req, res)) {
      return;
    }

    const notifications =
      await Notification.find({})
        .populate(
          "user",
          "userId fullName email phone"
        )
        .sort({
          createdAt: -1,
        })
        .limit(500);

    return res.status(200).json({
      success: true,
      count: notifications.length,
      notifications,
    });
  } catch (error) {
    console.error(
      "Get admin notifications error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to load notifications.",
    });
  }
};

// =====================================================
// ADMIN - SEND NOTIFICATION
// POST /api/notifications/admin/send
// =====================================================

const sendAdminNotification = async (
  req,
  res
) => {
  try {
    if (!checkAdmin(req, res)) {
      return;
    }

    // ---------------------------------------------------
    // INPUT
    // ---------------------------------------------------

    const {
      recipientType,
      userId,
      title,
      message,
      type,
      link,
    } = req.body;

    // ---------------------------------------------------
    // VALIDATE TITLE
    // ---------------------------------------------------

    const cleanTitle = String(
      title || ""
    ).trim();

    if (!cleanTitle) {
      return res.status(400).json({
        success: false,
        message:
          "Notification title is required.",
      });
    }

    if (cleanTitle.length > 200) {
      return res.status(400).json({
        success: false,
        message:
          "Notification title cannot exceed 200 characters.",
      });
    }

    // ---------------------------------------------------
    // VALIDATE MESSAGE
    // ---------------------------------------------------

    const cleanMessage = String(
      message || ""
    ).trim();

    if (!cleanMessage) {
      return res.status(400).json({
        success: false,
        message:
          "Notification message is required.",
      });
    }

    if (cleanMessage.length > 1000) {
      return res.status(400).json({
        success: false,
        message:
          "Notification message cannot exceed 1000 characters.",
      });
    }

    // ---------------------------------------------------
    // TYPE
    // ---------------------------------------------------

    const cleanType = String(
      type || "general"
    )
      .trim()
      .toLowerCase();

    const allowedTypes = [
      "general",
      "success",
      "error",
      "warning",
      "info",
    ];

    const finalType =
      allowedTypes.includes(cleanType)
        ? cleanType
        : "general";

    // ---------------------------------------------------
    // LINK
    // ---------------------------------------------------

    const cleanLink = String(
      link || ""
    ).trim();

    // ---------------------------------------------------
    // RECIPIENT TYPE
    // ---------------------------------------------------

    const finalRecipientType = String(
      recipientType || ""
    )
      .trim()
      .toLowerCase();

    if (
      finalRecipientType !== "all" &&
      finalRecipientType !== "user"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Recipient type must be 'all' or 'user'.",
      });
    }

    // ===================================================
    // SEND TO ONE USER
    // ===================================================

    if (
      finalRecipientType === "user"
    ) {
      if (!userId) {
        return res.status(400).json({
          success: false,
          message: "User ID is required.",
        });
      }

      if (
        !mongoose.Types.ObjectId.isValid(
          userId
        )
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid user ID.",
        });
      }

      const user = await User.findOne({
        _id: userId,
        role: {
          $ne: "admin",
        },
      }).select(
        "_id userId fullName email phone"
      );

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found.",
        });
      }

      const notification =
        await Notification.create({
          user: user._id,
          type: finalType,
          title: cleanTitle,
          message: cleanMessage,
          link: cleanLink,
          isRead: false,

          data: {
            sentByAdmin: req.user._id,
            recipientType: "user",
          },
        });

      return res.status(201).json({
        success: true,
        message:
          "Notification sent successfully.",
        sentCount: 1,
        notification,
      });
    }

    // ===================================================
    // SEND TO ALL USERS
    // ===================================================

    const users = await User.find({
      role: {
        $ne: "admin",
      },
    }).select("_id");

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No users found.",
      });
    }

    const documents = users.map(
      (user) => ({
        user: user._id,
        type: finalType,
        title: cleanTitle,
        message: cleanMessage,
        link: cleanLink,
        isRead: false,

        data: {
          sentByAdmin: req.user._id,
          recipientType: "all",
        },
      })
    );

    const inserted =
      await Notification.insertMany(
        documents
      );

    return res.status(201).json({
      success: true,
      message:
        `Notification sent to ${inserted.length} users.`,
      sentCount: inserted.length,
    });
  } catch (error) {
    console.error(
      "Send admin notification error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to send notification.",
      error:
        process.env.NODE_ENV ===
        "development"
          ? error.message
          : undefined,
    });
  }
};

// =====================================================
// ADMIN - DELETE NOTIFICATION
// DELETE /api/notifications/admin/:id
// =====================================================

const deleteAdminNotification = async (
  req,
  res
) => {
  try {
    if (!checkAdmin(req, res)) {
      return;
    }

    if (
      !mongoose.Types.ObjectId.isValid(
        req.params.id
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid notification ID.",
      });
    }

    const notification =
      await Notification.findByIdAndDelete(
        req.params.id
      );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Notification deleted successfully.",
    });
  } catch (error) {
    console.error(
      "Delete admin notification error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to delete notification.",
    });
  }
};

// =====================================================
// EXPORT
// =====================================================

module.exports = {
  getMyNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteMyNotification,
  getNotificationUsers,
  getAllAdminNotifications,
  sendAdminNotification,
  deleteAdminNotification,
};