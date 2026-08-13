const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/auth");

const User = require("../models/User");
const Notification = require("../models/notification.model");


// =====================================================
// ADMIN CHECK
// =====================================================

const adminOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Admin access required",
    });
  }

  next();
};


// =====================================================
// GET MY NOTIFICATIONS
// GET /api/notifications
// =====================================================

router.get("/", protect, async (req, res) => {
  try {
    const notifications = await Notification.find({
      user: req.user._id,
    })
      .sort({ createdAt: -1 })
      .limit(50);

    return res.status(200).json({
      success: true,
      count: notifications.length,
      notifications,
    });
  } catch (error) {
    console.error("Get notifications error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load notifications",
    });
  }
});


// =====================================================
// ADMIN SEND NOTIFICATION
//
// POST /api/notifications/admin/send
//
// Send to one user:
// {
//   "userId": "USER_MONGO_ID",
//   "title": "Hello",
//   "message": "Your message",
//   "type": "general"
// }
//
// Send to all users:
// {
//   "userId": "all",
//   "title": "Announcement",
//   "message": "Hello everyone",
//   "type": "general"
// }
// =====================================================

router.post(
  "/admin/send",
  protect,
  adminOnly,
  async (req, res) => {
    try {
      const {
        userId,
        title,
        message,
        type,
        link,
      } = req.body;

      // -----------------------------------------------
      // VALIDATION
      // -----------------------------------------------

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: "User is required",
        });
      }

      if (!title || !title.trim()) {
        return res.status(400).json({
          success: false,
          message: "Notification title is required",
        });
      }

      if (!message || !message.trim()) {
        return res.status(400).json({
          success: false,
          message: "Notification message is required",
        });
      }


      // -----------------------------------------------
      // SEND TO ALL USERS
      // -----------------------------------------------

      if (
        userId === "all" ||
        userId === "all-users" ||
        userId === "allUsers"
      ) {
        const users = await User.find({
          role: { $ne: "admin" },
        }).select("_id");

        if (!users.length) {
          return res.status(404).json({
            success: false,
            message: "No users found",
          });
        }

        const notifications = users.map((user) => ({
          user: user._id,
          title: title.trim(),
          message: message.trim(),
          type: type || "general",
          link: link || "",
          isRead: false,
        }));

        await Notification.insertMany(notifications);

        return res.status(201).json({
          success: true,
          message: `Notification sent to ${users.length} users`,
          count: users.length,
        });
      }


      // -----------------------------------------------
      // SEND TO SPECIFIC USER
      // -----------------------------------------------

      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // Prevent sending admin-to-admin notification
      if (user.role === "admin") {
        return res.status(400).json({
          success: false,
          message: "Cannot send notification to another admin",
        });
      }


      // -----------------------------------------------
      // CREATE NOTIFICATION
      // -----------------------------------------------

      const notification = await Notification.create({
        user: user._id,
        title: title.trim(),
        message: message.trim(),
        type: type || "general",
        link: link || "",
        isRead: false,
      });


      // -----------------------------------------------
      // RESPONSE
      // -----------------------------------------------

      return res.status(201).json({
        success: true,
        message: "Notification sent successfully",
        notification,
      });

    } catch (error) {
      console.error(
        "Admin send notification error:",
        error
      );

      return res.status(500).json({
        success: false,
        message: "Failed to send notification",
      });
    }
  }
);


// =====================================================
// MARK ONE NOTIFICATION AS READ
// PATCH /api/notifications/:id/read
// =====================================================

router.patch(
  "/:id/read",
  protect,
  async (req, res) => {
    try {
      const notification =
        await Notification.findOneAndUpdate(
          {
            _id: req.params.id,
            user: req.user._id,
          },
          {
            $set: {
              isRead: true,
            },
          },
          {
            new: true,
          }
        );

      if (!notification) {
        return res.status(404).json({
          success: false,
          message: "Notification not found",
        });
      }

      return res.status(200).json({
        success: true,
        notification,
      });

    } catch (error) {
      console.error(
        "Mark notification read error:",
        error
      );

      return res.status(500).json({
        success: false,
        message: "Failed to update notification",
      });
    }
  }
);


// =====================================================
// MARK ALL NOTIFICATIONS AS READ
// PATCH /api/notifications/read-all
// =====================================================

router.patch(
  "/read-all",
  protect,
  async (req, res) => {
    try {
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
        message: "All notifications marked as read",
      });

    } catch (error) {
      console.error(
        "Mark all notifications error:",
        error
      );

      return res.status(500).json({
        success: false,
        message: "Failed to update notifications",
      });
    }
  }
);


// =====================================================
// EXPORT
// =====================================================

module.exports = router;