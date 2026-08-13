const express = require("express");

const router =
  express.Router();

const {
  protect,
} = require("../middleware/auth");

const {
  getAllUsers,
  getSingleUser,
  manageUserBalance,
} = require("../controllers/admin.controller");


// ============================================================
// GET ALL USERS
// GET /api/admin/users
// ============================================================

router.get(
  "/users",
  protect,
  getAllUsers
);


// ============================================================
// GET SINGLE USER
// GET /api/admin/users/:id
// ============================================================

router.get(
  "/users/:id",
  protect,
  getSingleUser
);


// ============================================================
// MANAGE USER BALANCE
//
// POST /api/admin/users/:id/manage-balance
//
// Body:
//
// {
//   "balanceType": "wallet",
//   "action": "add",
//   "amount": 10,
//   "note": "Manual admin balance"
// }
//
// ============================================================

router.post(
  "/users/:id/manage-balance",
  protect,
  manageUserBalance
);


// ============================================================
// EXPORT
// ============================================================

module.exports =
  router;