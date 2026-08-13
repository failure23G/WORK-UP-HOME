const Message = require("../models/Message");
const User = require("../models/User");

// ========================================
// SEND MESSAGE
// User -> Admin
// Admin -> User
// Text + File
// ========================================

const sendMessage = async (req, res) => {
  try {
    const { receiverId, text } = req.body;

    // File comes from multer
    const file = req.file;

    // ======================================
    // CLEAN TEXT
    // ======================================

    const cleanText =
      typeof text === "string"
        ? text.trim()
        : "";

    // ======================================
    // TEXT + FILE BOTH EMPTY
    // ======================================

    if (!cleanText && !file) {
      return res.status(400).json({
        success: false,
        message:
          "Message text or file is required",
      });
    }

    // ======================================
    // RECEIVER REQUIRED
    // ======================================

    if (!receiverId) {
      return res.status(400).json({
        success: false,
        message: "Receiver is required",
      });
    }

    // ======================================
    // FIND RECEIVER
    // ======================================

    const receiver =
      await User.findById(receiverId);

    if (!receiver) {
      return res.status(404).json({
        success: false,
        message: "Receiver not found",
      });
    }

    // ======================================
    // USER CAN ONLY MESSAGE ADMIN
    // ======================================

    if (
      req.user.role !== "admin" &&
      receiver.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Users can only message the admin",
      });
    }

    // ======================================
    // ADMIN CANNOT MESSAGE ANOTHER ADMIN
    // ======================================

    if (
      req.user.role === "admin" &&
      receiver.role === "admin"
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Admin cannot message another admin",
      });
    }

    // ======================================
    // FILE DATA
    // ======================================

    let fileUrl = "";
    let fileName = "";
    let fileType = "";
    let fileSize = 0;

    if (file) {
      fileUrl =
        `/uploads/${file.filename}`;

      fileName =
        file.originalname;

      fileType =
        file.mimetype;

      fileSize =
        file.size;
    }

    // ======================================
    // CREATE MESSAGE
    // ======================================

    const message =
      await Message.create({
        sender: req.user._id,

        receiver:
          receiver._id,

        text: cleanText,

        fileUrl: fileUrl,

        fileName: fileName,

        fileType: fileType,

        fileSize: fileSize,

        isRead: false,
      });

    // ======================================
    // POPULATE SENDER
    // ======================================

    await message.populate(
      "sender",
      "fullName email role profileImage"
    );

    // ======================================
    // POPULATE RECEIVER
    // ======================================

    await message.populate(
      "receiver",
      "fullName email role profileImage"
    );

    // ======================================
    // RESPONSE
    // ======================================

    return res.status(201).json({
      success: true,
      message:
        "Message sent successfully",
      data: message,
    });
  } catch (error) {
    console.error(
      "Send message error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to send message",
    });
  }
};

// ========================================
// GET CONVERSATION
// User <-> Admin
// ========================================

const getConversation = async (
  req,
  res
) => {
  try {
    const { userId } = req.params;

    // ======================================
    // AUTHORIZATION
    // ======================================

    if (
      req.user.role !== "admin" &&
      req.user._id.toString() !==
        userId
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    // ======================================
    // FIND TARGET USER
    // ======================================

    const targetUser =
      await User.findById(userId);

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // ======================================
    // FIND ADMIN
    // ======================================

    const admin =
      await User.findOne({
        role: "admin",
      });

    if (!admin) {
      return res.status(404).json({
        success: false,
        message:
          "Admin account not found",
      });
    }

    // ======================================
    // FIND MESSAGES
    // ======================================

    const messages =
      await Message.find({
        $or: [
          {
            sender: userId,
            receiver:
              admin._id,
          },
          {
            sender:
              admin._id,
            receiver: userId,
          },
        ],
      })
        .populate(
          "sender",
          "fullName email role profileImage"
        )
        .populate(
          "receiver",
          "fullName email role profileImage"
        )
        .sort({
          createdAt: 1,
        });

    // ======================================
    // MARK MESSAGES AS READ
    // ======================================

    await Message.updateMany(
      {
        sender: userId,

        receiver:
          admin._id,

        isRead: false,
      },
      {
        $set: {
          isRead: true,
        },
      }
    );

    // ======================================
    // RESPONSE
    // ======================================

    return res.status(200).json({
      success: true,

      count:
        messages.length,

      data:
        messages,
    });
  } catch (error) {
    console.error(
      "Get conversation error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to load conversation",
    });
  }
};

// ========================================
// GET ADMIN ACCOUNT
// Used by users to start support chat
// ========================================

const getAdmin = async (
  req,
  res
) => {
  try {
    const admin =
      await User.findOne({
        role: "admin",
      }).select(
        "fullName email role profileImage"
      );

    if (!admin) {
      return res.status(404).json({
        success: false,
        message:
          "Admin support account not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: admin,
    });
  } catch (error) {
    console.error(
      "Get admin error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to find admin account",
    });
  }
};

// ========================================
// GET UNREAD MESSAGE COUNT
// ========================================

const getUnreadCount = async (
  req,
  res
) => {
  try {
    const count =
      await Message.countDocuments({
        receiver:
          req.user._id,

        isRead: false,
      });

    return res.status(200).json({
      success: true,
      count,
    });
  } catch (error) {
    console.error(
      "Unread count error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to get unread message count",
    });
  }
};

// ========================================
// GET ADMIN INBOX
// ========================================

const getAdminInbox = async (
  req,
  res
) => {
  try {
    // ======================================
    // ADMIN ONLY
    // ======================================

    if (
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Admin access required",
      });
    }

    const adminId =
      req.user._id;

    // ======================================
    // GET ALL ADMIN MESSAGES
    // ======================================

    const messages =
      await Message.find({
        $or: [
          {
            sender:
              adminId,
          },
          {
            receiver:
              adminId,
          },
        ],
      })
        .populate(
          "sender",
          "fullName email role profileImage"
        )
        .populate(
          "receiver",
          "fullName email role profileImage"
        )
        .sort({
          createdAt: -1,
        });

    // ======================================
    // CREATE CONVERSATION LIST
    // ======================================

    const conversationMap =
      new Map();

    for (
      const message of messages
    ) {
      if (
        !message.sender ||
        !message.receiver
      ) {
        continue;
      }

      const senderId =
        message.sender._id.toString();

      const receiverId =
        message.receiver._id.toString();

      let otherUser = null;

      // If admin sent message
      if (
        senderId ===
        adminId.toString()
      ) {
        otherUser =
          message.receiver;
      }

      // If user sent message
      else {
        otherUser =
          message.sender;
      }

      // Skip if no user
      if (!otherUser) {
        continue;
      }

      // Skip admin-to-admin
      if (
        otherUser.role ===
        "admin"
      ) {
        continue;
      }

      const otherUserId =
        otherUser._id.toString();

      // ====================================
      // FIRST MESSAGE FROM USER
      // ====================================

      if (
        !conversationMap.has(
          otherUserId
        )
      ) {
        conversationMap.set(
          otherUserId,
          {
            user:
              otherUser,

            lastMessage:
              message,

            unreadCount:
              0,
          }
        );
      }

      const conversation =
        conversationMap.get(
          otherUserId
        );

      // ====================================
      // UNREAD USER MESSAGE
      // ====================================

      if (
        receiverId ===
          adminId.toString() &&
        message.isRead === false
      ) {
        conversation.unreadCount +=
          1;
      }
    }

    // ======================================
    // CONVERT MAP TO ARRAY
    // ======================================

    const conversations =
      Array.from(
        conversationMap.values()
      );

    // ======================================
    // RESPONSE
    // ======================================

    return res.status(200).json({
      success: true,

      count:
        conversations.length,

      data:
        conversations,
    });
  } catch (error) {
    console.error(
      "Get admin inbox error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to load admin inbox",
    });
  }
};

// ========================================
// EXPORT ALL CONTROLLERS
// ========================================

module.exports = {
  sendMessage,
  getConversation,
  getAdmin,
  getUnreadCount,
  getAdminInbox,
};