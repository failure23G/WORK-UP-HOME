const mongoose = require("mongoose");

const jobSubmissionSchema = new mongoose.Schema(
  {
    /*
    ------------------------------------------------------------
    JOB
    ------------------------------------------------------------
    কোন job-এর জন্য worker submission দিয়েছে
    */

    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
      index: true,
    },

    /*
    ------------------------------------------------------------
    WORKER
    ------------------------------------------------------------
    যে user কাজটি করেছে
    */

    worker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    /*
    ------------------------------------------------------------
    CREATOR
    ------------------------------------------------------------
    Job যে user create করেছে,
    শুধু সেই creator submission Satisfy / Unsatisfy করতে পারবে।

    ADMIN এখানে review করতে পারবে না।
    ------------------------------------------------------------
    */

    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    /*
    ------------------------------------------------------------
    WORKER PROOF
    ------------------------------------------------------------
    */

    proofText: {
      type: String,
      default: "",
      trim: true,
    },

    proofImages: {
      type: [String],
      default: [],
    },

    /*
    ------------------------------------------------------------
    WORKER EARNING
    ------------------------------------------------------------
    Job-এর creator যেই earning set করবে
    worker satisfy হলে এই amount worker-এর earning/wallet-এ যাবে।
    ------------------------------------------------------------
    */

    earningUsd: {
      type: Number,
      min: 0,
      default: 0,
    },

    /*
    ------------------------------------------------------------
    SUBMISSION STATUS

    pending
      = worker কাজ submit করেছে,
        এখন job creator review করবে

    satisfy
      = job creator কাজ approve করেছে

    unsatisfy
      = job creator কাজ reject করেছে

    IMPORTANT:
    ADMIN এই status পরিবর্তন করবে না।
    ------------------------------------------------------------
    */

    status: {
      type: String,

      enum: [
        "pending",
        "satisfy",
        "unsatisfy",
      ],

      default: "pending",

      index: true,
    },

    /*
    ------------------------------------------------------------
    REVIEW INFORMATION
    ------------------------------------------------------------
    */

    reviewedAt: {
      type: Date,
      default: null,
    },

    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    reviewNote: {
      type: String,
      default: "",
      trim: true,
    },

    /*
    ------------------------------------------------------------
    SUBMITTED TIME
    ------------------------------------------------------------
    */

    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },

  {
    timestamps: true,
  }
);

/*
------------------------------------------------------------
ONE WORKER = ONE SUBMISSION FOR ONE JOB

একই user একই job বারবার submit করতে পারবে না।
------------------------------------------------------------
*/

jobSubmissionSchema.index(
  {
    job: 1,
    worker: 1,
  },
  {
    unique: true,
  }
);

/*
------------------------------------------------------------
MY WORK QUERY

Pending / Satisfy / Unsatisfy
সহজে এবং দ্রুত পাওয়া যাবে।
------------------------------------------------------------
*/

jobSubmissionSchema.index({
  worker: 1,
  status: 1,
  createdAt: -1,
});

/*
------------------------------------------------------------
JOB CREATOR REVIEW QUERY
------------------------------------------------------------
*/

jobSubmissionSchema.index({
  creator: 1,
  status: 1,
  createdAt: -1,
});

/*
------------------------------------------------------------
MODEL
------------------------------------------------------------
*/

module.exports =
  mongoose.models.JobSubmission ||
  mongoose.model(
    "JobSubmission",
    jobSubmissionSchema
  );