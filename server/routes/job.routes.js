const express = require("express");

const router = express.Router();

const {
  createJob,
  getAvailableJobs,
  submitJob,
  getMyWork,

  getMyCreatedJobs,
  getJobSubmissions,
  reviewSubmission,

  getAdminJobRequests,
  acceptJob,
  rejectJob,
  editJob,
  deleteJob,
} = require(
  "../controllers/job.controller"
);

const {
  protect,
} = require(
  "../middleware/auth"
);


// ============================================================
// CREATE JOB
// POST /api/jobs
// ============================================================

router.post(
  "/",
  protect,
  createJob
);


// ============================================================
// AVAILABLE JOBS
// GET /api/jobs
// ============================================================

router.get(
  "/",
  protect,
  getAvailableJobs
);


// ============================================================
// MY WORK
// GET /api/jobs/my-work
// ============================================================

router.get(
  "/my-work",
  protect,
  getMyWork
);


// ============================================================
// MY CREATED JOBS
// GET /api/jobs/my-created
// ============================================================

router.get(
  "/my-created",
  protect,
  getMyCreatedJobs
);


// ============================================================
// ADMIN JOB REQUESTS
// GET /api/jobs/admin/requests
// ============================================================

router.get(
  "/admin/requests",
  protect,
  getAdminJobRequests
);


// ============================================================
// ADMIN ACCEPT
// PATCH /api/jobs/admin/:id/accept
// ============================================================

router.patch(
  "/admin/:id/accept",
  protect,
  acceptJob
);


// ============================================================
// ADMIN REJECT
// PATCH /api/jobs/admin/:id/reject
// ============================================================

router.patch(
  "/admin/:id/reject",
  protect,
  rejectJob
);


// ============================================================
// ADMIN EDIT
// PATCH /api/jobs/admin/:id/edit
// ============================================================

router.patch(
  "/admin/:id/edit",
  protect,
  editJob
);


// ============================================================
// ADMIN DELETE
// DELETE /api/jobs/admin/:id/delete
// ============================================================

router.delete(
  "/admin/:id/delete",
  protect,
  deleteJob
);


// ============================================================
// JOB SUBMISSIONS
// GET /api/jobs/:id/submissions
// ============================================================

router.get(
  "/:id/submissions",
  protect,
  getJobSubmissions
);


// ============================================================
// SUBMIT WORK
// POST /api/jobs/:id/submit
// ============================================================

router.post(
  "/:id/submit",
  protect,
  submitJob
);


// ============================================================
// REVIEW SUBMISSION
// PATCH /api/jobs/submissions/:id/review
// ============================================================

router.patch(
  "/submissions/:id/review",
  protect,
  reviewSubmission
);


// ============================================================
// EXPORT
// ============================================================

module.exports = router;