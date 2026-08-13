const express = require("express");

const router = express.Router();

const {
  protect,
} = require("../middleware/auth");

const upload = require(
  "../middleware/chatUpload"
);

const {
  sendMessage,
  getConversation,
  getAdmin,
  getUnreadCount,
  getAdminInbox,
} = require(
  "../controllers/message.controller"
);

router.get(
  "/admin",
  protect,
  getAdmin
);

router.get(
  "/inbox",
  protect,
  getAdminInbox
);

router.get(
  "/unread",
  protect,
  getUnreadCount
);

// IMPORTANT
router.post(
  "/",
  protect,
  upload.single("file"),
  sendMessage
);

router.get(
  "/conversation/:userId",
  protect,
  getConversation
);

module.exports = router;