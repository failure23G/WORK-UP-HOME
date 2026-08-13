const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    creatorRole: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      required: true,
      trim: true,
    },

    subcategory: {
      type: String,
      default: "",
      trim: true,
    },

    note: {
      type: String,
      default: "",
      trim: true,
    },

    tasks: {
      type: [String],
      default: [],
    },

    proof: {
      type: String,
      default: "",
      trim: true,
    },

    workerNeed: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },

    workerEarn: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    screenshots: {
      type: Number,
      min: 0,
      default: 0,
    },

    estimatedDay: {
      type: Number,
      min: 0,
      default: 1,
    },

    boostPeriod: {
      type: String,
      default: "None",
      trim: true,
    },

    scheduleTime: {
      type: Date,
      default: null,
    },

    estimatedCost: {
      type: Number,
      min: 0,
      default: 0,
    },

    thumbnail: {
      name: {
        type: String,
        default: "",
      },

      type: {
        type: String,
        default: "",
      },

      size: {
        type: Number,
        default: 0,
      },

      url: {
        type: String,
        default: "",
      },
    },

    /*
    ------------------------------------------------------------
    JOB STATUS

    User creates job:
      pending

    Admin accepts:
      published

    Admin rejects:
      rejected

    Worker limit completed:
      closed

    Draft:
      draft
    ------------------------------------------------------------
    */

    status: {
      type: String,

      enum: [
        "pending",
        "published",
        "rejected",
        "closed",
        "draft",
      ],

      default: "pending",

      index: true,
    },

    /*
    ------------------------------------------------------------
    ADMIN REVIEW

    Admin only reviews JOB REQUEST.

    Admin can:
      Accept
      Reject
      Edit

    Admin does NOT review worker submission.
    ------------------------------------------------------------
    */

    adminReview: {
      reviewed: {
        type: Boolean,
        default: false,
      },

      reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
      },

      reviewedAt: {
        type: Date,
        default: null,
      },

      rejectionReason: {
        type: String,
        default: "",
        trim: true,
      },
    },

    /*
    ------------------------------------------------------------
    TOP JOB
    ------------------------------------------------------------
    */

    isTopJob: {
      type: Boolean,
      default: false,
    },

    /*
    ------------------------------------------------------------
    WORKER PROGRESS
    ------------------------------------------------------------
    */

    completedWorkers: {
      type: Number,
      min: 0,
      default: 0,
    },

    /*
    ------------------------------------------------------------
    PUBLISH / CLOSE TIME
    ------------------------------------------------------------
    */

    publishedAt: {
      type: Date,
      default: null,
    },

    closedAt: {
      type: Date,
      default: null,
    },
  },

  {
    timestamps: true,
  }
);

/*
------------------------------------------------------------
INDEXES
------------------------------------------------------------
*/

jobSchema.index({
  status: 1,
  createdAt: -1,
});

jobSchema.index({
  creator: 1,
  status: 1,
});

/*
------------------------------------------------------------
AVAILABLE WORKERS
------------------------------------------------------------
*/

jobSchema.virtual("availableWorkers").get(function () {
  const workerNeed = Number(
    this.workerNeed || 0
  );

  const completedWorkers = Number(
    this.completedWorkers || 0
  );

  return Math.max(
    0,
    workerNeed - completedWorkers
  );
});

/*
------------------------------------------------------------
JSON / OBJECT VIRTUAL SUPPORT
------------------------------------------------------------
*/

jobSchema.set("toJSON", {
  virtuals: true,
});

jobSchema.set("toObject", {
  virtuals: true,
});

/*
------------------------------------------------------------
MODEL
------------------------------------------------------------
*/

module.exports =
  mongoose.models.Job ||
  mongoose.model("Job", jobSchema);