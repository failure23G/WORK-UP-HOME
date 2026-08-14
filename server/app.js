const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const path = require("path");

const connectDB = require("./config/db");

// ========================================
// ROUTES
// ========================================

const authRoutes = require("./routes/auth.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const messageRoutes = require("./routes/message.routes");
const notificationRoutes = require("./routes/notification.routes");
const jobRoutes = require("./routes/job.routes");

const depositRoutes = require("./routes/deposit.routes");
const adminDepositRoutes = require("./routes/admin.deposit.routes");

const withdrawRoutes = require("./routes/withdrawRoutes");
const adminWithdrawRoutes = require("./routes/admin.withdraw.routes");

// ADMIN USER / PROFILE
const adminRoutes = require("./routes/admin.routes");


// ========================================
// LOAD ENV
// ========================================

dotenv.config();


// ========================================
// CREATE APP
// ========================================

const app = express();


// ========================================
// DATABASE
// ========================================

connectDB();


// ========================================
// CORS
// ========================================

app.use(
  cors({
   origin: "https://workuphome26.netlify.app",
    credentials: true,
  })
);


// ========================================
// SECURITY
// ========================================

app.use(helmet());

app.use(
  morgan("dev")
);


// ========================================
// BODY PARSER
// ========================================

app.use(
  express.json()
);

app.use(
  express.urlencoded({
    extended: true,
  })
);


// ========================================
// COOKIE
// ========================================

app.use(
  cookieParser()
);


// ========================================
// STATIC UPLOADS
// ========================================

app.use(
  "/uploads",
  express.static(
    path.join(
      __dirname,
      "uploads"
    )
  )
);


// ========================================
// HOME / HEALTH CHECK
// ========================================

app.get(
  "/",
  (req, res) => {
    res.status(200).json({
      success: true,
      message:
        "Work Up Home Server Running...",
    });
  }
);


// ========================================
// AUTH ROUTES
// ========================================

app.use(
  "/api/auth",
  authRoutes
);


// ========================================
// DASHBOARD ROUTES
// ========================================

app.use(
  "/api/dashboard",
  dashboardRoutes
);


// ========================================
// MESSAGE ROUTES
// ========================================

app.use(
  "/api/messages",
  messageRoutes
);


// ========================================
// NOTIFICATION ROUTES
// ========================================

app.use(
  "/api/notifications",
  notificationRoutes
);


// ========================================
// JOB ROUTES
// ========================================

app.use(
  "/api/jobs",
  jobRoutes
);


// ========================================
// USER DEPOSIT ROUTES
// ========================================

app.use(
  "/api/deposits",
  depositRoutes
);


// ========================================
// ADMIN DEPOSIT ROUTES
// ========================================

app.use(
  "/api/admin/deposits",
  adminDepositRoutes
);


// ========================================
// USER WITHDRAW ROUTES
// ========================================
//
// POST /api/withdrawals
// GET  /api/withdrawals/my
//
// ========================================

app.use(
  "/api/withdrawals",
  withdrawRoutes
);


// ========================================
// ADMIN WITHDRAW ROUTES
// ========================================
//
// GET   /api/admin/withdraws
// GET   /api/admin/withdraws/pending
// GET   /api/admin/withdraws/:id
// PATCH /api/admin/withdraws/:id/approve
// PATCH /api/admin/withdraws/:id/reject
//
// ========================================

app.use(
  "/api/admin/withdraws",
  adminWithdrawRoutes
);


// ========================================
// ADMIN USER / PROFILE ROUTES
// ========================================
//
// GET /api/admin/users
// GET /api/admin/users/:id
//
// ========================================

app.use(
  "/api/admin",
  adminRoutes
);


// ========================================
// 404 ROUTE
// ========================================

app.use(
  (req, res) => {

    res.status(404).json({
      success: false,
      message:
        `Route not found: ${req.method} ${req.originalUrl}`,
    });

  }
);


// ========================================
// GLOBAL ERROR HANDLER
// ========================================

app.use(
  (
    err,
    req,
    res,
    next
  ) => {

    console.error(
      "Server Error:",
      err
    );

    res.status(
      err.status || 500
    ).json({
      success: false,
      message:
        err.message ||
        "Internal Server Error",
    });

  }
);


// ========================================
// EXPORT APP
// ========================================

module.exports = app;