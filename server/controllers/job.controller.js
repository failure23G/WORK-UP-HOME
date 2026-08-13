const Job = require("../models/Job");
const JobSubmission = require("../models/JobSubmission");
const User = require("../models/User");
const Notification = require("../models/Notification");

/*
============================================================
HELPERS
============================================================
*/

const isAdmin = (user) => {
  const role = String(user?.role || "").toLowerCase();

  return (
    role === "admin" ||
    user?.isAdmin === true
  );
};

const getUserId = (user) => {
  return user?._id || user?.id;
};

const sendNotification = async (
  userId,
  title,
  message,
  type = "info"
) => {
  try {
    if (!userId) {
      return;
    }

    await Notification.create({
      user: userId,
      title,
      message,
      type,
    });
  } catch (error) {
    console.error(
      "Notification error:",
      error
    );
  }
};


/*
============================================================
CREATE JOB
============================================================

NORMAL USER
-----------
Create Job
   ↓
pending
   ↓
Admin Approval
   ↓
published / rejected

ADMIN
-----
Create Job
   ↓
published

============================================================
*/

exports.createJob = async (req, res) => {
  try {
    const userId = getUserId(req.user);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const {
      category,
      subcategory,
      jobTitle,
      title,
      note,
      tasks,
      proof,
      workerNeed,
      workerEarn,
      screenshots,
      estimatedDay,
      boostPeriod,
      scheduleTime,
      estimatedCost,
      thumbnail,
      isTopJob,
    } = req.body;

    const finalTitle = String(
      jobTitle || title || ""
    ).trim();

    if (!finalTitle) {
      return res.status(400).json({
        success: false,
        message: "Job title is required",
      });
    }

    if (!String(category || "").trim()) {
      return res.status(400).json({
        success: false,
        message: "Category is required",
      });
    }

    if (!String(subcategory || "").trim()) {
      return res.status(400).json({
        success: false,
        message: "Subcategory is required",
      });
    }

    const finalTasks = Array.isArray(tasks)
      ? tasks
          .map((task) =>
            String(task || "").trim()
          )
          .filter(Boolean)
      : [];

    if (!finalTasks.length) {
      return res.status(400).json({
        success: false,
        message: "At least one task is required",
      });
    }

    if (!String(proof || "").trim()) {
      return res.status(400).json({
        success: false,
        message: "Required proof is required",
      });
    }

    const finalWorkerNeed = Number(workerNeed);

    if (
      !Number.isFinite(finalWorkerNeed) ||
      finalWorkerNeed < 1
    ) {
      return res.status(400).json({
        success: false,
        message: "Worker need must be at least 1",
      });
    }

    const finalWorkerEarn = Number(workerEarn);

    if (
      !Number.isFinite(finalWorkerEarn) ||
      finalWorkerEarn <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Worker earning must be greater than 0",
      });
    }

    const adminCreated = isAdmin(req.user);

    let parsedSchedule = null;

    if (scheduleTime) {
      const scheduleDate = new Date(scheduleTime);

      if (
        !Number.isNaN(
          scheduleDate.getTime()
        )
      ) {
        parsedSchedule = scheduleDate;
      }
    }

    const calculatedCost =
      finalWorkerNeed *
      finalWorkerEarn;

    const suppliedCost = Number(
      estimatedCost
    );

    const finalEstimatedCost =
      Number.isFinite(suppliedCost)
        ? suppliedCost
        : calculatedCost;

    const job = await Job.create({
      creator: userId,

      creatorRole: adminCreated
        ? "admin"
        : "user",

      title: finalTitle,

      category: String(
        category
      ).trim(),

      subcategory: String(
        subcategory
      ).trim(),

      note: String(
        note || ""
      ).trim(),

      tasks: finalTasks,

      proof: String(
        proof
      ).trim(),

      workerNeed:
        finalWorkerNeed,

      workerEarn:
        finalWorkerEarn,

      screenshots: Math.max(
        0,
        Number(screenshots) || 0
      ),

      estimatedDay: Math.max(
        0,
        Number(estimatedDay) || 0
      ),

      boostPeriod: String(
        boostPeriod || "None"
      ).trim(),

      scheduleTime:
        parsedSchedule,

      estimatedCost:
        finalEstimatedCost,

      thumbnail:
        thumbnail &&
        typeof thumbnail === "object"
          ? {
              name: String(
                thumbnail.name || ""
              ),
              type: String(
                thumbnail.type || ""
              ),
              size:
                Number(
                  thumbnail.size
                ) || 0,
              url: String(
                thumbnail.url || ""
              ),
            }
          : undefined,

      isTopJob: adminCreated
        ? Boolean(isTopJob)
        : false,

      status: adminCreated
        ? "published"
        : "pending",

      publishedAt: adminCreated
        ? new Date()
        : null,
    });


    /*
    ----------------------------------------------------------
    NOTIFY ADMINS
    ----------------------------------------------------------
    */

    if (!adminCreated) {
      try {
        const admins = await User.find({
          $or: [
            {
              role: "admin",
            },
            {
              isAdmin: true,
            },
          ],
        }).select("_id");

        await Promise.all(
          admins.map((admin) =>
            sendNotification(
              admin._id,
              "New Job Request",
              `A new job "${job.title}" is waiting for admin approval.`,
              "info"
            )
          )
        );
      } catch (error) {
        console.error(
          "Admin notification error:",
          error
        );
      }
    }


    return res.status(201).json({
      success: true,

      message: adminCreated
        ? "Job published successfully"
        : "Job submitted for admin approval",

      data: {
        ...job.toObject(),
        id: job._id,
        jobTitle: job.title,
      },
    });

  } catch (error) {
    console.error(
      "Create job error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to create job",
    });
  }
};


/*
============================================================
GET AVAILABLE JOBS
============================================================

শুধু published job worker দেখতে পারবে।

যখন satisfy worker count
workerNeed-এর সমান হবে,
job Available Jobs থেকে চলে যাবে।

============================================================
*/

exports.getAvailableJobs = async (
  req,
  res
) => {
  try {
    const jobs = await Job.find({
      status: "published",
    })
      .populate(
        "creator",
        "name username email role"
      )
      .sort({
        isTopJob: -1,
        createdAt: -1,
      })
      .lean();

    if (!jobs.length) {
      return res.json({
        success: true,
        data: [],
      });
    }

    const jobIds = jobs.map(
      (job) => job._id
    );

    const progressRows =
      await JobSubmission.aggregate([
        {
          $match: {
            job: {
              $in: jobIds,
            },
            status: "satisfy",
          },
        },

        {
          $group: {
            _id: "$job",

            completedWorkers: {
              $sum: 1,
            },
          },
        },
      ]);

    const progressMap = new Map(
      progressRows.map((row) => [
        String(row._id),
        Number(
          row.completedWorkers || 0
        ),
      ])
    );

    const data = jobs
      .map((job) => {
        const completedWorkers =
          progressMap.get(
            String(job._id)
          ) || 0;

        const workerNeed =
          Number(
            job.workerNeed || 0
          );

        const availableWorkers =
          Math.max(
            0,
            workerNeed -
              completedWorkers
          );

        const progressPercent =
          workerNeed > 0
            ? Math.min(
                100,
                (completedWorkers /
                  workerNeed) *
                  100
              )
            : 0;

        return {
          ...job,

          id: job._id,

          jobTitle:
            job.title,

          completedWorkers,

          startedWorkers:
            completedWorkers,

          availableWorkers,

          progressPercent,
        };
      })
      .filter(
        (job) =>
          Number(
            job.completedWorkers || 0
          ) <
          Number(
            job.workerNeed || 0
          )
      );

    return res.json({
      success: true,
      data,
    });

  } catch (error) {
    console.error(
      "Get available jobs error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to load jobs",
    });
  }
};


/*
============================================================
SUBMIT JOB
============================================================

Worker
  ↓
Submit Proof
  ↓
pending
  ↓
Job Creator Review
  ↓
satisfy / unsatisfy

============================================================
*/

exports.submitJob = async (
  req,
  res
) => {
  try {
    const workerId =
      getUserId(req.user);

    if (!workerId) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required",
      });
    }

    const {
      proofText,
      proofImages,
    } = req.body;

    const job =
      await Job.findById(
        req.params.id
      );

    if (
      !job ||
      job.status !== "published"
    ) {
      return res.status(404).json({
        success: false,
        message:
          "Job is not available",
      });
    }


    /*
    ----------------------------------------------------------
    CREATOR CANNOT WORK OWN JOB
    ----------------------------------------------------------
    */

    if (
      String(job.creator) ===
      String(workerId)
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You cannot work on your own job",
      });
    }


    /*
    ----------------------------------------------------------
    ONE WORKER = ONE SUBMISSION
    ----------------------------------------------------------
    */

    const existing =
      await JobSubmission.findOne({
        job: job._id,
        worker: workerId,
      });

    if (existing) {
      return res.status(400).json({
        success: false,
        message:
          "You already submitted this job",
      });
    }


    /*
    ----------------------------------------------------------
    CHECK COMPLETED WORKER LIMIT
    ----------------------------------------------------------
    */

    const completedWorkers =
      await JobSubmission.countDocuments({
        job: job._id,
        status: "satisfy",
      });

    if (
      completedWorkers >=
      Number(job.workerNeed)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "This job has reached the worker limit",
      });
    }


    /*
    ----------------------------------------------------------
    CREATE SUBMISSION
    ----------------------------------------------------------
    */

    const submission =
      await JobSubmission.create({
        job: job._id,

        worker:
          workerId,

        creator:
          job.creator,

        proofText:
          typeof proofText ===
          "string"
            ? proofText.trim()
            : "",

        proofImages:
          Array.isArray(
            proofImages
          )
            ? proofImages
            : [],

        earningUsd:
          Number(
            job.workerEarn || 0
          ),

        status:
          "pending",

        submittedAt:
          new Date(),
      });


    /*
    ----------------------------------------------------------
    POPULATE SUBMISSION
    ----------------------------------------------------------
    */

    await submission.populate([
      {
        path: "job",

        select:
          "title category subcategory workerEarn",
      },

      {
        path: "worker",

        select:
          "name username email",
      },

      {
        path: "creator",

        select:
          "name username email",
      },
    ]);


    /*
    ----------------------------------------------------------
    NOTIFY CREATOR
    ----------------------------------------------------------
    */

    await sendNotification(
      job.creator,
      "New Job Submission",
      `A worker submitted "${job.title}". Please review the work.`,
      "info"
    );


    return res.status(201).json({
      success: true,

      message:
        "Job submitted successfully. Waiting for creator review.",

      data: submission,
    });

  } catch (error) {
    console.error(
      "Submit job error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to submit job",
    });
  }
};


/*
============================================================
GET MY WORK
============================================================

Worker নিজের submitted jobs দেখবে।

pending
satisfy
unsatisfy

============================================================
*/

exports.getMyWork = async (
  req,
  res
) => {
  try {
    const workerId =
      getUserId(req.user);

    if (!workerId) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required",
      });
    }

    const submissions =
      await JobSubmission.find({
        worker: workerId,
      })
        .populate({
          path: "job",

          populate: {
            path: "creator",

            select:
              "name username email role",
          },
        })
        .populate(
          "creator",
          "name username email role"
        )
        .sort({
          createdAt: -1,
        });

    const pending = [];
    const satisfy = [];
    const unsatisfy = [];

    submissions.forEach(
      (submission) => {
        const status =
          String(
            submission.status ||
            "pending"
          ).toLowerCase();

        if (
          status === "pending"
        ) {
          pending.push(
            submission
          );
        }

        if (
          status === "satisfy" ||
          status === "satisfied"
        ) {
          satisfy.push(
            submission
          );
        }

        if (
          status === "unsatisfy" ||
          status === "unsatisfied"
        ) {
          unsatisfy.push(
            submission
          );
        }
      }
    );

    return res.json({
      success: true,

      data: {
        pending,
        satisfy,
        unsatisfy,
        all: submissions,
      },
    });

  } catch (error) {
    console.error(
      "Get my work error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to load My Work",
    });
  }
};


/*
============================================================
GET MY CREATED JOBS
============================================================

Creator-এর সব job দেখাবে।

সবচেয়ে গুরুত্বপূর্ণ:
worker submission-গুলোও
প্রতিটি job-এর ভিতরে থাকবে।

এখান থেকেই frontend
Approve / Reject করতে পারবে।

============================================================
*/

exports.getMyCreatedJobs =
  async (req, res) => {
    try {
      const creatorId =
        getUserId(req.user);

      if (!creatorId) {
        return res.status(401).json({
          success: false,
          message:
            "Authentication required",
        });
      }

      const jobs =
        await Job.find({
          creator: creatorId,
        })
          .populate(
            "creator",
            "name username email role"
          )
          .sort({
            createdAt: -1,
          })
          .lean();

      if (!jobs.length) {
        return res.json({
          success: true,
          data: [],
        });
      }


      /*
      --------------------------------------------------------
      GET ALL SUBMISSIONS FOR THESE JOBS
      --------------------------------------------------------
      */

      const jobIds =
        jobs.map(
          (job) => job._id
        );

      const submissions =
        await JobSubmission.find({
          job: {
            $in: jobIds,
          },
        })
          .populate(
            "worker",
            "name username email"
          )
          .populate(
            "creator",
            "name username email role"
          )
          .sort({
            createdAt: -1,
          })
          .lean();


      /*
      --------------------------------------------------------
      GROUP SUBMISSIONS BY JOB
      --------------------------------------------------------
      */

      const submissionsMap =
        new Map();

      submissions.forEach(
        (submission) => {
          const key =
            String(
              submission.job
            );

          if (
            !submissionsMap.has(
              key
            )
          ) {
            submissionsMap.set(
              key,
              []
            );
          }

          submissionsMap
            .get(key)
            .push(
              submission
            );
        }
      );


      /*
      --------------------------------------------------------
      ATTACH SUBMISSIONS TO EACH JOB
      --------------------------------------------------------
      */

      const data =
        jobs.map((job) => {
          const jobSubmissions =
            submissionsMap.get(
              String(job._id)
            ) || [];

          const pending =
            jobSubmissions.filter(
              (submission) =>
                String(
                  submission.status ||
                  "pending"
                ).toLowerCase() ===
                "pending"
            ).length;

          const approved =
            jobSubmissions.filter(
              (submission) =>
                [
                  "satisfy",
                  "satisfied",
                ].includes(
                  String(
                    submission.status ||
                    ""
                  ).toLowerCase()
                )
            ).length;

          const rejected =
            jobSubmissions.filter(
              (submission) =>
                [
                  "unsatisfy",
                  "unsatisfied",
                ].includes(
                  String(
                    submission.status ||
                    ""
                  ).toLowerCase()
                )
            ).length;

          return {
            ...job,

            id:
              job._id,

            jobTitle:
              job.title,

            submissions:
              jobSubmissions,

            submissionStats: {
              total:
                jobSubmissions.length,

              pending,

              approved,

              rejected,
            },
          };
        });

      return res.json({
        success: true,
        data,
      });

    } catch (error) {
      console.error(
        "Get my created jobs error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to load My Jobs",
      });
    }
  };


/*
============================================================
GET JOB SUBMISSIONS
============================================================

শুধু Job Creator তার নিজের
job-এর worker submissions দেখতে পারবে।

============================================================
*/

exports.getJobSubmissions =
  async (req, res) => {
    try {
      const creatorId =
        getUserId(req.user);

      if (!creatorId) {
        return res.status(401).json({
          success: false,
          message:
            "Authentication required",
        });
      }

      const job =
        await Job.findById(
          req.params.id
        );

      if (!job) {
        return res.status(404).json({
          success: false,
          message:
            "Job not found",
        });
      }


      /*
      --------------------------------------------------------
      ONLY JOB CREATOR
      --------------------------------------------------------
      */

      if (
        String(job.creator) !==
        String(creatorId)
      ) {
        return res.status(403).json({
          success: false,
          message:
            "Only the job creator can view worker submissions",
        });
      }


      const submissions =
        await JobSubmission.find({
          job: job._id,
        })
          .populate(
            "worker",
            "name username email"
          )
          .populate(
            "creator",
            "name username email role"
          )
          .sort({
            createdAt: -1,
          });

      return res.json({
        success: true,

        data: {
          job,
          submissions,
        },
      });

    } catch (error) {
      console.error(
        "Get job submissions error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to load job submissions",
      });
    }
  };


/*
============================================================
REVIEW WORKER SUBMISSION
============================================================

ONLY JOB CREATOR

satisfy
unsatisfy

ADMIN CANNOT REVIEW WORKER WORK.

============================================================
*/

exports.reviewSubmission =
  async (req, res) => {
    try {
      const reviewerId =
        getUserId(req.user);

      if (!reviewerId) {
        return res.status(401).json({
          success: false,
          message:
            "Authentication required",
        });
      }

      const {
        status,
        reviewNote,
      } = req.body;


      /*
      --------------------------------------------------------
      VALID STATUS
      --------------------------------------------------------
      */

      if (
        ![
          "satisfy",
          "unsatisfy",
        ].includes(status)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Status must be satisfy or unsatisfy",
        });
      }


      /*
      --------------------------------------------------------
      FIND SUBMISSION
      --------------------------------------------------------
      */

      const submission =
        await JobSubmission.findById(
          req.params.id
        );

      if (!submission) {
        return res.status(404).json({
          success: false,
          message:
            "Job submission not found",
        });
      }


      /*
      --------------------------------------------------------
      ADMIN CANNOT REVIEW
      --------------------------------------------------------
      */

      if (
        isAdmin(req.user)
      ) {
        return res.status(403).json({
          success: false,
          message:
            "Admin cannot satisfy or unsatisfy worker submissions",
        });
      }


      /*
      --------------------------------------------------------
      ONLY CREATOR
      --------------------------------------------------------
      */

      if (
        String(
          submission.creator
        ) !==
        String(
          reviewerId
        )
      ) {
        return res.status(403).json({
          success: false,
          message:
            "Only the job creator can review this submission",
        });
      }


      /*
      --------------------------------------------------------
      ALREADY REVIEWED
      --------------------------------------------------------
      */

      if (
        submission.status !==
        "pending"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "This submission has already been reviewed",
        });
      }


      /*
      --------------------------------------------------------
      FIND JOB
      --------------------------------------------------------
      */

      const job =
        await Job.findById(
          submission.job
        );

      if (!job) {
        return res.status(404).json({
          success: false,
          message:
            "Job not found",
        });
      }


      /*
      --------------------------------------------------------
      UPDATE SUBMISSION
      --------------------------------------------------------
      */

      submission.status =
        status;

      submission.reviewedAt =
        new Date();

      submission.reviewedBy =
        reviewerId;

      submission.reviewNote =
        String(
          reviewNote || ""
        ).trim();

      await submission.save();


      /*
      ========================================================
      SATISFY
      ========================================================
      */

      if (
        status === "satisfy"
      ) {
        const worker =
          await User.findById(
            submission.worker
          );

        if (worker) {
          const amount =
            Number(
              submission.earningUsd ||
              0
            );

          worker.earning =
            Number(
              worker.earning || 0
            ) + amount;

          worker.wallet =
            Number(
              worker.wallet || 0
            ) + amount;

          await worker.save();
        }


        /*
        ------------------------------------------------------
        COUNT COMPLETED WORKERS
        ------------------------------------------------------
        */

        const completedWorkers =
          await JobSubmission.countDocuments({
            job: job._id,
            status: "satisfy",
          });

        job.completedWorkers =
          completedWorkers;


        /*
        ------------------------------------------------------
        CLOSE JOB WHEN LIMIT REACHED
        ------------------------------------------------------
        */

        if (
          completedWorkers >=
          Number(
            job.workerNeed
          )
        ) {
          job.status =
            "closed";

          job.closedAt =
            new Date();
        }

        await job.save();


        /*
        ------------------------------------------------------
        NOTIFY WORKER
        ------------------------------------------------------
        */

        await sendNotification(
          submission.worker,

          "Job Satisfied",

          `Your job "${job.title}" was satisfied by the job creator. $${Number(
            submission.earningUsd || 0
          ).toFixed(
            3
          )} has been added to your earning and wallet balance.`,

          "success"
        );


        return res.json({
          success: true,

          message:
            "Job marked satisfy",

          data:
            submission,
        });
      }


      /*
      ========================================================
      UNSATISFY
      ========================================================
      */

      await sendNotification(
        submission.worker,

        "Job Unsatisfied",

        `Your job "${job.title}" was marked unsatisfied by the job creator.`,

        "warning"
      );


      return res.json({
        success: true,

        message:
          "Job marked unsatisfy",

        data:
          submission,
      });

    } catch (error) {
      console.error(
        "Review submission error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to review job submission",
      });
    }
  };


/*
============================================================
ADMIN: GET JOB REQUESTS
============================================================

এখানে:

Pending
Approved
Rejected
Total

সব আলাদা count হবে।

IMPORTANT:
Approved job database থেকে delete হবে না।
Rejected job-ও delete হবে না।

============================================================
*/

exports.getAdminJobRequests =
  async (req, res) => {
    try {
      if (
        !isAdmin(req.user)
      ) {
        return res.status(403).json({
          success: false,
          message:
            "Admin access required",
        });
      }


      /*
      --------------------------------------------------------
      ONLY NORMAL USER CREATED JOBS
      --------------------------------------------------------
      */

      const jobs =
        await Job.find({
          creatorRole:
            "user",

          status: {
            $in: [
              "pending",
              "published",
              "closed",
              "rejected",
            ],
          },
        })
          .populate(
            "creator",
            "name username email role"
          )
          .sort({
            createdAt: -1,
          });


      /*
      --------------------------------------------------------
      COUNTS
      --------------------------------------------------------
      */

      const pending =
        jobs.filter(
          (job) =>
            job.status ===
            "pending"
        ).length;

      const approved =
        jobs.filter(
          (job) =>
            job.status ===
              "published" ||
            job.status ===
              "closed"
        ).length;

      const rejected =
        jobs.filter(
          (job) =>
            job.status ===
            "rejected"
        ).length;

      const total =
        jobs.length;


      return res.json({
        success: true,

        data: jobs,

        stats: {
          pending,
          approved,
          rejected,
          total,
        },
      });

    } catch (error) {
      console.error(
        "Admin job request error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to load job requests",
      });
    }
  };


/*
============================================================
ADMIN: ACCEPT JOB
============================================================

pending → published

Job delete হবে না।

============================================================
*/

exports.acceptJob = async (
  req,
  res
) => {
  try {
    if (
      !isAdmin(req.user)
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Admin access required",
      });
    }

    const job =
      await Job.findById(
        req.params.id
      );

    if (!job) {
      return res.status(404).json({
        success: false,
        message:
          "Job not found",
      });
    }

    if (
      job.status !==
      "pending"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Only pending jobs can be accepted",
      });
    }


    /*
    --------------------------------------------------------
    UPDATE STATUS
    --------------------------------------------------------
    */

    job.status =
      "published";

    if (!job.adminReview) {
      job.adminReview = {};
    }

    job.adminReview.reviewed =
      true;

    job.adminReview.reviewedBy =
      getUserId(req.user);

    job.adminReview.reviewedAt =
      new Date();

    job.adminReview.rejectionReason =
      "";

    job.publishedAt =
      new Date();

    await job.save();


    /*
    --------------------------------------------------------
    NOTIFY CREATOR
    --------------------------------------------------------
    */

    await sendNotification(
      job.creator,

      "Job Accepted",

      `Your job "${job.title}" has been accepted and is now available.`,

      "success"
    );


    /*
    --------------------------------------------------------
    NOTIFY NORMAL USERS
    --------------------------------------------------------
    */

    try {
      const users =
        await User.find({
          $and: [
            {
              role: {
                $ne: "admin",
              },
            },

            {
              isAdmin: {
                $ne: true,
              },
            },
          ],
        }).select("_id");

      await Promise.all(
        users.map(
          (user) =>
            sendNotification(
              user._id,

              "New Job Available",

              `A new job "${job.title}" is now available. Check the Jobs section to start working.`,

              "info"
            )
        )
      );

      console.log(
        `New job notification sent to ${users.length} users`
      );

    } catch (
      notificationError
    ) {
      console.error(
        "All users notification error:",
        notificationError
      );
    }


    return res.json({
      success: true,

      message:
        "Job accepted, published and users notified successfully",

      data: job,
    });

  } catch (error) {
    console.error(
      "Accept job error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to accept job",
    });
  }
};


/*
============================================================
ADMIN: REJECT JOB
============================================================

pending → rejected

Job delete হবে না।

============================================================
*/

exports.rejectJob = async (
  req,
  res
) => {
  try {
    if (
      !isAdmin(req.user)
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Admin access required",
      });
    }

    const {
      reason,
      rejectionReason,
    } = req.body;

    const finalReason =
      String(
        reason ||
        rejectionReason ||
        ""
      ).trim();

    const job =
      await Job.findById(
        req.params.id
      );

    if (!job) {
      return res.status(404).json({
        success: false,
        message:
          "Job not found",
      });
    }

    if (
      job.status !==
      "pending"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Only pending jobs can be rejected",
      });
    }


    /*
    --------------------------------------------------------
    UPDATE STATUS
    --------------------------------------------------------
    */

    job.status =
      "rejected";

    if (!job.adminReview) {
      job.adminReview = {};
    }

    job.adminReview.reviewed =
      true;

    job.adminReview.reviewedBy =
      getUserId(req.user);

    job.adminReview.reviewedAt =
      new Date();

    job.adminReview.rejectionReason =
      finalReason;

    await job.save();


    /*
    --------------------------------------------------------
    NOTIFY CREATOR
    --------------------------------------------------------
    */

    await sendNotification(
      job.creator,

      "Job Rejected",

      finalReason
        ? `Your job "${job.title}" was rejected by admin. Reason: ${finalReason}`
        : `Your job "${job.title}" was rejected by admin.`,

      "warning"
    );


    return res.json({
      success: true,

      message:
        "Job rejected successfully",

      data: job,
    });

  } catch (error) {
    console.error(
      "Reject job error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to reject job",
    });
  }
};


/*
============================================================
ADMIN: DELETE JOB
============================================================

শুধু ADMIN job delete করতে পারবে।

Normal creator delete করতে পারবে না।

============================================================
*/

exports.deleteJob = async (
  req,
  res
) => {
  try {
    if (
      !isAdmin(req.user)
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Admin access required",
      });
    }

    const job =
      await Job.findById(
        req.params.id
      );

    if (!job) {
      return res.status(404).json({
        success: false,
        message:
          "Job not found",
      });
    }


    /*
    --------------------------------------------------------
    DELETE SUBMISSIONS FIRST
    --------------------------------------------------------
    */

    await JobSubmission.deleteMany({
      job: job._id,
    });


    /*
    --------------------------------------------------------
    DELETE JOB
    --------------------------------------------------------
    */

    await Job.deleteOne({
      _id: job._id,
    });


    return res.json({
      success: true,
      message:
        "Job deleted successfully",
    });

  } catch (error) {
    console.error(
      "Delete job error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to delete job",
    });
  }
};


/*
============================================================
ADMIN: EDIT JOB
============================================================
*/

exports.editJob = async (
  req,
  res
) => {
  try {
    if (
      !isAdmin(req.user)
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Admin access required",
      });
    }

    const job =
      await Job.findById(
        req.params.id
      );

    if (!job) {
      return res.status(404).json({
        success: false,
        message:
          "Job not found",
      });
    }


    const allowedFields = [
      "title",
      "jobTitle",
      "category",
      "subcategory",
      "note",
      "tasks",
      "proof",
      "workerNeed",
      "workerEarn",
      "screenshots",
      "estimatedDay",
      "boostPeriod",
      "scheduleTime",
      "estimatedCost",
      "isTopJob",
    ];


    allowedFields.forEach(
      (field) => {
        if (
          req.body[field] ===
          undefined
        ) {
          return;
        }

        if (
          field ===
          "jobTitle"
        ) {
          job.title =
            String(
              req.body[field]
            ).trim();

          return;
        }

        job[field] =
          req.body[field];
      }
    );


    /*
    --------------------------------------------------------
    KEEP ESTIMATED COST CORRECT
    --------------------------------------------------------
    */

    if (
      req.body.workerNeed !==
        undefined ||
      req.body.workerEarn !==
        undefined
    ) {
      const workerNeed =
        Number(
          job.workerNeed
        );

      const workerEarn =
        Number(
          job.workerEarn
        );

      if (
        Number.isFinite(
          workerNeed
        ) &&
        Number.isFinite(
          workerEarn
        )
      ) {
        job.estimatedCost =
          workerNeed *
          workerEarn;
      }
    }


    await job.save();


    await sendNotification(
      job.creator,

      "Job Updated",

      `Your job "${job.title}" was edited by admin.`,

      "info"
    );


    return res.json({
      success: true,

      message:
        "Job updated successfully",

      data: job,
    });

  } catch (error) {
    console.error(
      "Edit job error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to edit job",
    });
  }
};