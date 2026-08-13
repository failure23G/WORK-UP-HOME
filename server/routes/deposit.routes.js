const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const router = express.Router();

// =====================================================
// CONTROLLER
// =====================================================

const {
  createDeposit,
  getMyDeposits,
  getDepositById,
} = require("../controllers/deposit.controller");

// =====================================================
// AUTH
// =====================================================

const {
  protect,
} = require("../middleware/auth");

// =====================================================
// UPLOAD DIRECTORY
// =====================================================

const uploadDirectory =
  path.join(
    __dirname,
    "../uploads/deposits"
  );

if (
  !fs.existsSync(uploadDirectory)
) {
  fs.mkdirSync(
    uploadDirectory,
    {
      recursive: true,
    }
  );
}

// =====================================================
// MULTER STORAGE
// =====================================================

const storage =
  multer.diskStorage({
    destination: (
      req,
      file,
      cb
    ) => {
      cb(
        null,
        uploadDirectory
      );
    },

    filename: (
      req,
      file,
      cb
    ) => {
      const extension =
        path.extname(
          file.originalname
        ).toLowerCase();

      const uniqueName =
        `deposit-${Date.now()}-${Math.round(
          Math.random() * 1e9
        )}${extension}`;

      cb(
        null,
        uniqueName
      );
    },
  });

// =====================================================
// FILE FILTER
// =====================================================

const fileFilter = (
  req,
  file,
  cb
) => {
  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
  ];

  if (
    allowedTypes.includes(
      file.mimetype
    )
  ) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Only JPG, JPEG, PNG and WEBP images are allowed."
      ),
      false
    );
  }
};

// =====================================================
// MULTER
// =====================================================

const upload = multer({
  storage,

  fileFilter,

  limits: {
    fileSize:
      5 * 1024 * 1024,
  },
});

// =====================================================
// CREATE DEPOSIT
// POST /api/deposits
// =====================================================

router.post(
  "/",
  protect,
  upload.single(
    "paymentScreenshot"
  ),
  createDeposit
);

// =====================================================
// MY DEPOSIT HISTORY
// GET /api/deposits/my
// =====================================================

router.get(
  "/my",
  protect,
  getMyDeposits
);

// =====================================================
// SINGLE DEPOSIT
// GET /api/deposits/:id
// =====================================================

router.get(
  "/:id",
  protect,
  getDepositById
);

// =====================================================
// UPLOAD ERROR HANDLER
// =====================================================

router.use(
  (
    error,
    req,
    res,
    next
  ) => {
    if (
      error instanceof
      multer.MulterError
    ) {
      if (
        error.code ===
        "LIMIT_FILE_SIZE"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Screenshot size must be 5MB or less.",
        });
      }

      return res.status(400).json({
        success: false,
        message:
          error.message,
      });
    }

    if (error) {
      return res.status(400).json({
        success: false,
        message:
          error.message ||
          "File upload failed.",
      });
    }

    next();
  }
);

// =====================================================
// EXPORT
// =====================================================

module.exports = router;