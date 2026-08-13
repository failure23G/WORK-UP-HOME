import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import "./MyJob.css";

const API_BASE =
  import.meta.env.VITE_API_URL ||
  "https://work-up-home.onrender.com";

/* ============================================================
   AUTH
============================================================ */

const getToken = () => {
  return (
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("authToken") ||
    ""
  );
};

const getAuthHeaders = () => {
  const token = getToken();

  return {
    "Content-Type": "application/json",
    ...(token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {}),
  };
};

/* ============================================================
   HELPERS
============================================================ */

const getJobId = (job) => {
  return job?._id || job?.id || "";
};

const getSubmissionId = (submission) => {
  return submission?._id || submission?.id || "";
};

const getWorkerName = (submission) => {
  const worker = submission?.worker;

  if (worker && typeof worker === "object") {
    return (
      worker.name ||
      worker.username ||
      worker.email ||
      "Unknown Worker"
    );
  }

  return (
    submission?.workerName ||
    submission?.username ||
    submission?.email ||
    "Unknown Worker"
  );
};

const getWorkerEmail = (submission) => {
  const worker = submission?.worker;

  if (worker && typeof worker === "object") {
    return (
      worker.email ||
      worker.username ||
      "-"
    );
  }

  return (
    submission?.email ||
    "-"
  );
};

const getStatus = (submission) => {
  return String(
    submission?.status || "pending"
  ).toLowerCase();
};

const formatDate = (date) => {
  if (!date) {
    return "-";
  }

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "-";
  }

  return parsed.toLocaleString(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }
  );
};

const getJobStatusClass = (job) => {
  const status = String(
    job?.status || "pending"
  ).toLowerCase();

  if (status === "published") {
    return "published";
  }

  if (status === "rejected") {
    return "rejected";
  }

  if (status === "closed") {
    return "closed";
  }

  return "pending";
};

/* ============================================================
   COMPONENT
============================================================ */

const MyJob = () => {
  const [jobs, setJobs] = useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [actionLoading, setActionLoading] =
    useState("");

  const [expandedJob, setExpandedJob] =
    useState(null);

  /* ==========================================================
     LOAD MY JOBS + WORKER SUBMISSIONS
  ========================================================== */

  const loadMyJobs = useCallback(
    async () => {
      setLoading(true);
      setError("");

      try {
        /* ------------------------------------------------------
           STEP 1:
           Get jobs created by current user
        ------------------------------------------------------ */

        const response = await fetch(
          `${API_BASE}/api/jobs/my-created`,
          {
            method: "GET",
            headers: getAuthHeaders(),
          }
        );

        const data =
          await response
            .json()
            .catch(() => ({}));

        if (!response.ok) {
          throw new Error(
            data?.message ||
              "Failed to load My Jobs"
          );
        }

        const jobData =
          Array.isArray(data?.data)
            ? data.data
            : [];

        /* ------------------------------------------------------
           STEP 2:
           Get submissions for every job
        ------------------------------------------------------ */

        const jobsWithSubmissions =
          await Promise.all(
            jobData.map(
              async (job) => {
                const jobId =
                  getJobId(job);

                if (!jobId) {
                  return {
                    ...job,
                    submissions: [],
                  };
                }

                try {
                  const submissionResponse =
                    await fetch(
                      `${API_BASE}/api/jobs/${jobId}/submissions`,
                      {
                        method: "GET",
                        headers:
                          getAuthHeaders(),
                      }
                    );

                  const submissionData =
                    await submissionResponse
                      .json()
                      .catch(() => ({}));

                  if (
                    !submissionResponse.ok
                  ) {
                    console.error(
                      `Failed to load submissions for job ${jobId}:`,
                      submissionData?.message
                    );

                    return {
                      ...job,
                      submissions: [],
                    };
                  }

                  const submissions =
                    Array.isArray(
                      submissionData?.data
                        ?.submissions
                    )
                      ? submissionData.data
                          .submissions
                      : [];

                  return {
                    ...job,
                    submissions,
                  };
                } catch (err) {
                  console.error(
                    `Submission loading error for job ${jobId}:`,
                    err
                  );

                  return {
                    ...job,
                    submissions: [],
                  };
                }
              }
            )
          );

        /* ------------------------------------------------------
           STEP 3:
           Save jobs with submissions
        ------------------------------------------------------ */

        setJobs(
          jobsWithSubmissions
        );
      } catch (err) {
        console.error(
          "My Jobs error:",
          err
        );

        setError(
          err?.message ||
            "Failed to load My Jobs"
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /* ============================================================
     INITIAL LOAD
  ============================================================ */

  useEffect(() => {
    loadMyJobs();
  }, [loadMyJobs]);

  /* ============================================================
     STATS
  ============================================================ */

  const stats = useMemo(() => {
    let totalJobs = jobs.length;

    let pendingJobs = 0;
    let approvedJobs = 0;
    let rejectedJobs = 0;

    let totalSubmissions = 0;
    let pendingSubmissions = 0;
    let approvedSubmissions = 0;
    let rejectedSubmissions = 0;

    jobs.forEach((job) => {
      const jobStatus =
        String(
          job?.status || "pending"
        ).toLowerCase();

      if (
        jobStatus === "pending"
      ) {
        pendingJobs++;
      }

      if (
        jobStatus === "published"
      ) {
        approvedJobs++;
      }

      if (
        jobStatus === "rejected"
      ) {
        rejectedJobs++;
      }

      const submissions =
        Array.isArray(
          job?.submissions
        )
          ? job.submissions
          : [];

      totalSubmissions +=
        submissions.length;

      submissions.forEach(
        (submission) => {
          const status =
            getStatus(
              submission
            );

          if (
            status === "pending"
          ) {
            pendingSubmissions++;
          }

          if (
            status === "satisfy" ||
            status === "satisfied"
          ) {
            approvedSubmissions++;
          }

          if (
            status === "unsatisfy" ||
            status === "unsatisfied"
          ) {
            rejectedSubmissions++;
          }
        }
      );
    });

    return {
      totalJobs,
      pendingJobs,
      approvedJobs,
      rejectedJobs,
      totalSubmissions,
      pendingSubmissions,
      approvedSubmissions,
      rejectedSubmissions,
    };
  }, [jobs]);

  /* ============================================================
     APPROVE / REJECT WORKER SUBMISSION
  ============================================================ */

  const handleReview = async (
    submission,
    status
  ) => {
    const submissionId =
      getSubmissionId(
        submission
      );

    if (!submissionId) {
      setError(
        "Submission ID not found."
      );
      return;
    }

    const isApprove =
      status === "satisfy";

    const confirmed =
      window.confirm(
        isApprove
          ? "Are you sure you want to approve this worker's work?"
          : "Are you sure you want to reject this worker's work?"
      );

    if (!confirmed) {
      return;
    }

    setActionLoading(
      `${status}-${submissionId}`
    );

    setError("");
    setSuccess("");

    try {
      /* --------------------------------------------------------
         SEND REVIEW TO BACKEND
      -------------------------------------------------------- */

      const response = await fetch(
        `${API_BASE}/api/jobs/submissions/${submissionId}/review`,
        {
          method: "PATCH",

          headers:
            getAuthHeaders(),

          body: JSON.stringify({
            status,

            reviewNote: isApprove
              ? "Work approved by job creator."
              : "Work rejected by job creator.",
          }),
        }
      );

      const data =
        await response
          .json()
          .catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Failed to review worker submission."
        );
      }

      /* --------------------------------------------------------
         SUCCESS MESSAGE
      -------------------------------------------------------- */

      setSuccess(
        data?.message ||
          (
            isApprove
              ? "Worker work approved successfully."
              : "Worker work rejected successfully."
          )
      );

      /* --------------------------------------------------------
         UPDATE LOCAL SUBMISSION STATUS
      -------------------------------------------------------- */

      setJobs(
        (previousJobs) =>
          previousJobs.map(
            (job) => {
              const submissions =
                Array.isArray(
                  job?.submissions
                )
                  ? job.submissions
                  : [];

              return {
                ...job,

                submissions:
                  submissions.map(
                    (item) => {
                      const itemId =
                        getSubmissionId(
                          item
                        );

                      if (
                        String(
                          itemId
                        ) !==
                        String(
                          submissionId
                        )
                      ) {
                        return item;
                      }

                      return {
                        ...item,

                        status,

                        reviewedAt:
                          new Date().toISOString(),

                        reviewNote:
                          isApprove
                            ? "Work approved by job creator."
                            : "Work rejected by job creator.",
                      };
                    }
                  ),
              };
            }
          )
      );

      /* --------------------------------------------------------
         RELOAD FROM SERVER
         This keeps worker count / earning / job status accurate.
      -------------------------------------------------------- */

      setTimeout(() => {
        loadMyJobs();
      }, 500);
    } catch (err) {
      console.error(
        "Review submission error:",
        err
      );

      setError(
        err?.message ||
          "Failed to review worker submission."
      );
    } finally {
      setActionLoading("");
    }
  };

  /* ============================================================
     DELETE JOB
     ============================================================ */

  const handleDeleteJob = async (
    job
  ) => {
    const jobId =
      getJobId(job);

    if (!jobId) {
      setError(
        "Job ID not found."
      );
      return;
    }

    const confirmed =
      window.confirm(
        `Are you sure you want to delete "${job?.title || "this job"}"?`
      );

    if (!confirmed) {
      return;
    }

    setError("");
    setSuccess("");
    setActionLoading(
      `delete-${jobId}`
    );

    try {
      const response =
        await fetch(
          `${API_BASE}/api/jobs/${jobId}`,
          {
            method: "DELETE",
            headers:
              getAuthHeaders(),
          }
        );

      const data =
        await response
          .json()
          .catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Failed to delete job."
        );
      }

      setJobs(
        (previousJobs) =>
          previousJobs.filter(
            (item) =>
              String(
                getJobId(item)
              ) !==
              String(jobId)
          )
      );

      if (
        String(
          expandedJob
        ) === String(jobId)
      ) {
        setExpandedJob(null);
      }

      setSuccess(
        data?.message ||
          "Job deleted successfully."
      );
    } catch (err) {
      console.error(
        "Delete job error:",
        err
      );

      setError(
        err?.message ||
          "Failed to delete job."
      );
    } finally {
      setActionLoading("");
    }
  };

  /* ============================================================
     EMPTY STATE
  ============================================================ */

  if (
    !loading &&
    !error &&
    jobs.length === 0
  ) {
    return (
      <div className="my-job-page">
        <div className="my-job-container">
          <div className="my-job-header">
            <div>
              <span className="my-job-eyebrow">
                WORK UP HOME
              </span>

              <h1>
                My Job
              </h1>

              <p>
                Manage the jobs you
                created and review
                worker submissions.
              </p>
            </div>

            <button
              type="button"
              className="my-job-refresh"
              onClick={
                loadMyJobs
              }
            >
              ↻ Refresh
            </button>
          </div>

          <div className="my-job-empty">
            <div className="my-job-empty-icon">
              📋
            </div>

            <h2>
              No Jobs Yet
            </h2>

            <p>
              You have not created
              any jobs yet.
            </p>
          </div>
        </div>
      </div>
    );
  }

  /* ============================================================
     MAIN
  ============================================================ */

  return (
    <div className="my-job-page">
      <div className="my-job-container">

        {/* ======================================================
            HEADER
        ====================================================== */}

        <div className="my-job-header">
          <div>
            <span className="my-job-eyebrow">
              WORK UP HOME
            </span>

            <h1>
              My Job
            </h1>

            <p>
              View your created jobs
              and approve or reject
              worker work.
            </p>
          </div>

          <button
            type="button"
            className="my-job-refresh"
            onClick={
              loadMyJobs
            }
            disabled={
              loading
            }
          >
            ↻ Refresh
          </button>
        </div>

        {/* ======================================================
            ALERTS
        ====================================================== */}

        {success && (
          <div className="my-job-success">
            ✓ {success}
          </div>
        )}

        {error && (
          <div className="my-job-error">
            ⚠ {error}
          </div>
        )}

        {/* ======================================================
            STATS
        ====================================================== */}

        <div className="my-job-stats">

          <div className="my-job-stat-card">
            <span>
              My Jobs
            </span>

            <strong>
              {stats.totalJobs}
            </strong>
          </div>

          <div className="my-job-stat-card">
            <span>
              Approved Jobs
            </span>

            <strong>
              {stats.approvedJobs}
            </strong>
          </div>

          <div className="my-job-stat-card">
            <span>
              Worker Submissions
            </span>

            <strong>
              {stats.totalSubmissions}
            </strong>
          </div>

          <div className="my-job-stat-card pending-stat">
            <span>
              Waiting Review
            </span>

            <strong>
              {stats.pendingSubmissions}
            </strong>
          </div>

        </div>

        {/* ======================================================
            LOADING
        ====================================================== */}

        {loading && (
          <div className="my-job-loading">
            <div className="my-job-spinner"></div>

            <p>
              Loading your jobs...
            </p>
          </div>
        )}

        {/* ======================================================
            JOB LIST
        ====================================================== */}

        {!loading && (
          <div className="my-job-list">

            {jobs.map((job) => {
              const jobId =
                getJobId(job);

              const submissions =
                Array.isArray(
                  job?.submissions
                )
                  ? job.submissions
                  : [];

              const pendingCount =
                submissions.filter(
                  (submission) =>
                    getStatus(
                      submission
                    ) === "pending"
                ).length;

              const approvedCount =
                submissions.filter(
                  (submission) => {
                    const status =
                      getStatus(
                        submission
                      );

                    return (
                      status ===
                        "satisfy" ||
                      status ===
                        "satisfied"
                    );
                  }
                ).length;

              const rejectedCount =
                submissions.filter(
                  (submission) => {
                    const status =
                      getStatus(
                        submission
                      );

                    return (
                      status ===
                        "unsatisfy" ||
                      status ===
                        "unsatisfied"
                    );
                  }
                ).length;

              const isExpanded =
                String(
                  expandedJob
                ) ===
                String(jobId);

              return (
                <div
                  className="my-job-card"
                  key={
                    jobId ||
                    Math.random()
                  }
                >

                  {/* =================================================
                      JOB TOP
                  ================================================= */}

                  <div className="my-job-card-top">

                    <div>
                      <div className="my-job-category">
                        {job?.category ||
                          "General"}

                        {job?.subcategory
                          ? ` • ${job.subcategory}`
                          : ""}
                      </div>

                      <h2>
                        {job?.title ||
                          job?.jobTitle ||
                          "Untitled Job"}
                      </h2>

                      <p className="my-job-note">
                        {job?.note ||
                          "No job note provided."}
                      </p>
                    </div>

                    <span
                      className={
                        `my-job-status ${getJobStatusClass(
                          job
                        )}`
                      }
                    >
                      {String(
                        job?.status ||
                          "pending"
                      )}
                    </span>

                  </div>

                  {/* =================================================
                      JOB INFO
                  ================================================= */}

                  <div className="my-job-info-grid">

                    <div>
                      <span>
                        Worker Need
                      </span>

                      <strong>
                        {job?.workerNeed ??
                          0}
                      </strong>
                    </div>

                    <div>
                      <span>
                        Worker Earn
                      </span>

                      <strong>
                        $
                        {Number(
                          job?.workerEarn ||
                            0
                        ).toFixed(3)}
                      </strong>
                    </div>

                    <div>
                      <span>
                        Submissions
                      </span>

                      <strong>
                        {submissions.length}
                      </strong>
                    </div>

                    <div>
                      <span>
                        Pending Review
                      </span>

                      <strong>
                        {pendingCount}
                      </strong>
                    </div>

                  </div>

                  {/* =================================================
                      SUBMISSION SUMMARY
                  ================================================= */}

                  {submissions.length >
                    0 && (
                    <div
                      className="my-job-submission-summary"
                    >
                      <div>
                        <span>
                          Total
                        </span>

                        <strong>
                          {
                            submissions.length
                          }
                        </strong>
                      </div>

                      <div>
                        <span>
                          Pending
                        </span>

                        <strong>
                          {
                            pendingCount
                          }
                        </strong>
                      </div>

                      <div>
                        <span>
                          Approved
                        </span>

                        <strong>
                          {
                            approvedCount
                          }
                        </strong>
                      </div>

                      <div>
                        <span>
                          Rejected
                        </span>

                        <strong>
                          {
                            rejectedCount
                          }
                        </strong>
                      </div>
                    </div>
                  )}

                  {/* =================================================
                      TASKS
                  ================================================= */}

                  {Array.isArray(
                    job?.tasks
                  ) &&
                    job.tasks.length >
                      0 && (
                      <div className="my-job-tasks">

                        <h3>
                          Job Tasks
                        </h3>

                        <ol>
                          {job.tasks.map(
                            (
                              task,
                              index
                            ) => (
                              <li
                                key={
                                  `${jobId}-task-${index}`
                                }
                              >
                                {task}
                              </li>
                            )
                          )}
                        </ol>

                      </div>
                    )}

                  {/* =================================================
                      PROOF REQUIREMENT
                  ================================================= */}

                  {job?.proof && (
                    <div className="my-job-proof-requirement">

                      <strong>
                        Required Proof
                      </strong>

                      <p>
                        {job.proof}
                      </p>

                    </div>
                  )}

                  {/* =================================================
                      DELETE JOB
                  ================================================= */}

                  <button
                    type="button"
                    className="my-job-delete-button"
                    onClick={() =>
                      handleDeleteJob(
                        job
                      )
                    }
                    disabled={
                      actionLoading ===
                      `delete-${jobId}`
                    }
                  >
                    {actionLoading ===
                    `delete-${jobId}`
                      ? "Deleting..."
                      : "Delete Job"}
                  </button>

                  {/* =================================================
                      VIEW SUBMISSIONS
                  ================================================= */}

                  <button
                    type="button"
                    className="my-job-view-button"
                    onClick={() =>
                      setExpandedJob(
                        isExpanded
                          ? null
                          : jobId
                      )
                    }
                  >
                    {isExpanded
                      ? "Hide Worker Work"
                      : `View Worker Work (${submissions.length})`}

                    <span>
                      {isExpanded
                        ? "↑"
                        : "↓"}
                    </span>
                  </button>

                  {/* =================================================
                      WORKER SUBMISSIONS
                  ================================================= */}

                  {isExpanded && (
                    <div className="my-job-submissions">

                      {submissions.length ===
                      0 ? (
                        <div className="my-job-no-submission">

                          <div>
                            👷
                          </div>

                          <h3>
                            No Worker Submission Yet
                          </h3>

                          <p>
                            Workers have not
                            submitted their
                            work for this
                            job yet.
                          </p>

                        </div>
                      ) : (
                        submissions.map(
                          (
                            submission,
                            index
                          ) => {
                            const status =
                              getStatus(
                                submission
                              );

                            const submissionId =
                              getSubmissionId(
                                submission
                              );

                            const isPending =
                              status ===
                              "pending";

                            const approveKey =
                              `satisfy-${submissionId}`;

                            const rejectKey =
                              `unsatisfy-${submissionId}`;

                            return (
                              <div
                                className="worker-submission-card"
                                key={
                                  submissionId ||
                                  index
                                }
                              >

                                {/* =================================
                                    WORKER HEADER
                                ================================= */}

                                <div className="worker-header">

                                  <div className="worker-avatar">
                                    👤
                                  </div>

                                  <div>
                                    <h3>
                                      {getWorkerName(
                                        submission
                                      )}
                                    </h3>

                                    <span>
                                      {
                                        getWorkerEmail(
                                          submission
                                        )
                                      }
                                    </span>

                                    <span>
                                      Submitted{" "}
                                      {formatDate(
                                        submission?.createdAt
                                      )}
                                    </span>
                                  </div>

                                  <span
                                    className={
                                      `submission-status ${
                                        status ===
                                          "satisfy" ||
                                        status ===
                                          "satisfied"
                                          ? "approved"
                                          : status ===
                                              "unsatisfy" ||
                                            status ===
                                              "unsatisfied"
                                          ? "rejected"
                                          : "waiting"
                                      }`
                                    }
                                  >
                                    {status ===
                                        "satisfy" ||
                                      status ===
                                        "satisfied"
                                      ? "Approved"
                                      : status ===
                                          "unsatisfy" ||
                                        status ===
                                          "unsatisfied"
                                      ? "Rejected"
                                      : "Waiting Review"}
                                  </span>

                                </div>

                                {/* =================================
                                    PROOF TEXT
                                ================================= */}

                                {submission?.proofText && (
                                  <div className="worker-proof">

                                    <h4>
                                      Work / Proof
                                    </h4>

                                    <div className="worker-proof-box">
                                      {
                                        submission.proofText
                                      }
                                    </div>

                                  </div>
                                )}

                                {/* =================================
                                    PROOF IMAGES
                                ================================= */}

                                {Array.isArray(
                                  submission?.proofImages
                                ) &&
                                  submission
                                    .proofImages
                                    .length >
                                    0 && (
                                    <div className="worker-images">

                                      <h4>
                                        Submitted Images
                                      </h4>

                                      <div className="worker-image-grid">

                                        {submission.proofImages.map(
                                          (
                                            image,
                                            imageIndex
                                          ) => {
                                            const imageUrl =
                                              typeof image ===
                                              "string"
                                                ? image
                                                : image?.url;

                                            if (
                                              !imageUrl
                                            ) {
                                              return null;
                                            }

                                            return (
                                              <a
                                                href={
                                                  imageUrl
                                                }
                                                target="_blank"
                                                rel="noreferrer"
                                                key={
                                                  imageIndex
                                                }
                                              >
                                                <img
                                                  src={
                                                    imageUrl
                                                  }
                                                  alt={
                                                    `Worker proof ${
                                                      imageIndex +
                                                      1
                                                    }`
                                                  }
                                                />
                                              </a>
                                            );
                                          }
                                        )}

                                      </div>

                                    </div>
                                  )}

                                {/* =================================
                                    REVIEW NOTE
                                ================================= */}

                                {submission?.reviewNote && (
                                  <div className="worker-review-note">

                                    <strong>
                                      Review Note
                                    </strong>

                                    <p>
                                      {
                                        submission.reviewNote
                                      }
                                    </p>

                                  </div>
                                )}

                                {/* =================================
                                    APPROVE / REJECT
                                ================================= */}

                                {isPending && (
                                  <div className="worker-actions">

                                    <button
                                      type="button"
                                      className="approve-work-button"
                                      disabled={
                                        actionLoading ===
                                          approveKey ||
                                        actionLoading ===
                                          rejectKey
                                      }
                                      onClick={() =>
                                        handleReview(
                                          submission,
                                          "satisfy"
                                        )
                                      }
                                    >
                                      {actionLoading ===
                                      approveKey
                                        ? "Approving..."
                                        : "✓ Approve Work"}
                                    </button>

                                    <button
                                      type="button"
                                      className="reject-work-button"
                                      disabled={
                                        actionLoading ===
                                          approveKey ||
                                        actionLoading ===
                                          rejectKey
                                      }
                                      onClick={() =>
                                        handleReview(
                                          submission,
                                          "unsatisfy"
                                        )
                                      }
                                    >
                                      {actionLoading ===
                                      rejectKey
                                        ? "Rejecting..."
                                        : "✕ Reject Work"}
                                    </button>

                                  </div>
                                )}

                              </div>
                            );
                          }
                        )
                      )}

                    </div>
                  )}

                </div>
              );
            })}

          </div>
        )}

      </div>
    </div>
  );
};

export default MyJob;