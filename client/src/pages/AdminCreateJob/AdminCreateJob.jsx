import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import "./AdminCreateJob.css";

const API_BASE =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

const AdminCreateJob = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [actionLoading, setActionLoading] =
    useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [selectedJob, setSelectedJob] =
    useState(null);

  const [filter, setFilter] =
    useState("pending");

  // ============================================================
  // TOKEN
  // ============================================================

  const getToken = () => {
    return (
      localStorage.getItem("token") ||
      localStorage.getItem("accessToken") ||
      ""
    );
  };

  // ============================================================
  // HELPERS
  // ============================================================

  const getJobId = (job) => {
    return job?._id || job?.id || "";
  };

  const getStatus = (job) => {
    const status = String(
      job?.status ||
        job?.approvalStatus ||
        "pending"
    ).toLowerCase();

    if (
      status === "accepted" ||
      status === "approve" ||
      status === "approved"
    ) {
      return "approved";
    }

    if (
      status === "rejected" ||
      status === "reject" ||
      status === "declined"
    ) {
      return "rejected";
    }

    return "pending";
  };

  const getJobTitle = (job) => {
    return (
      job?.title ||
      job?.jobTitle ||
      job?.name ||
      "Untitled Job"
    );
  };

  const getCreator = (job) => {
    const creator =
      job?.creator ||
      job?.user ||
      job?.createdBy ||
      job?.owner;

    if (
      creator &&
      typeof creator === "object"
    ) {
      return (
        creator?.name ||
        creator?.username ||
        creator?.fullName ||
        creator?.email ||
        "Unknown User"
      );
    }

    return (
      job?.userName ||
      job?.username ||
      job?.fullName ||
      "Unknown User"
    );
  };

  const getEmail = (job) => {
    const creator =
      job?.creator ||
      job?.user ||
      job?.createdBy ||
      job?.owner;

    if (
      creator &&
      typeof creator === "object"
    ) {
      return creator?.email || "-";
    }

    return (
      job?.email ||
      job?.userEmail ||
      "-"
    );
  };

  const getCategory = (job) => {
    return (
      job?.category ||
      job?.jobCategory ||
      job?.type ||
      "General"
    );
  };

  const getSubcategory = (job) => {
    return (
      job?.subcategory ||
      job?.subCategory ||
      job?.jobSubcategory ||
      "-"
    );
  };

  const getWorkers = (job) => {
    return Number(
      job?.workerNeed ??
        job?.workersNeeded ??
        job?.workerCount ??
        job?.workers ??
        0
    );
  };

  const getEarn = (job) => {
    return Number(
      job?.workerEarn ??
        job?.workerReward ??
        job?.reward ??
        job?.earn ??
        job?.amount ??
        0
    );
  };

  const getCost = (job) => {
    return Number(
      job?.estimatedCost ??
        job?.totalCost ??
        job?.cost ??
        0
    );
  };

  const getDescription = (job) => {
    return (
      job?.description ||
      job?.note ||
      job?.jobNote ||
      job?.details ||
      "No description provided."
    );
  };

  const getTasks = (job) => {
    if (Array.isArray(job?.tasks)) {
      return job.tasks;
    }

    if (Array.isArray(job?.taskList)) {
      return job.taskList;
    }

    if (Array.isArray(job?.steps)) {
      return job.steps;
    }

    return [];
  };

  const getProof = (job) => {
    return (
      job?.proof ||
      job?.requiredProof ||
      job?.proofRequirement ||
      job?.proofNote ||
      "No proof requirement provided."
    );
  };

  const getLocation = (job) => {
    return (
      job?.location ||
      job?.jobLocation ||
      "-"
    );
  };

  const getDeadline = (job) => {
    return (
      job?.deadline ||
      job?.dueDate ||
      job?.endDate ||
      "-"
    );
  };

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    const value = new Date(date);

    if (Number.isNaN(value.getTime())) {
      return "-";
    }

    return value.toLocaleString(
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

  // ============================================================
  // LOAD JOB REQUESTS
  // ============================================================

  const loadJobs = useCallback(
    async () => {
      setLoading(true);
      setError("");

      try {
        const token = getToken();

        const response = await fetch(
          `${API_BASE}/api/jobs/admin/requests`,
          {
            method: "GET",

            headers: {
              "Content-Type":
                "application/json",

              ...(token
                ? {
                    Authorization:
                      `Bearer ${token}`,
                  }
                : {}),
            },
          }
        );

        let data = {};

        try {
          data = await response.json();
        } catch {
          data = {};
        }

        if (!response.ok) {
          throw new Error(
            data?.message ||
              "Failed to load job requests."
          );
        }

        let list = [];

        if (Array.isArray(data)) {
          list = data;
        } else if (
          Array.isArray(data?.jobs)
        ) {
          list = data.jobs;
        } else if (
          Array.isArray(data?.data)
        ) {
          list = data.data;
        } else if (
          Array.isArray(data?.requests)
        ) {
          list = data.requests;
        }

        setJobs(list);
      } catch (err) {
        console.error(
          "Admin job request error:",
          err
        );

        setError(
          err?.message ||
            "Failed to load job requests."
        );

        setJobs([]);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // ============================================================
  // INITIAL LOAD
  // ============================================================

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  // ============================================================
  // APPROVE / REJECT JOB
  // ============================================================

  const handleAction = async (
    job,
    action
  ) => {
    const id = getJobId(job);

    if (!id) {
      setError(
        "Job ID could not be found."
      );
      return;
    }

    const actionKey =
      `${action}-${id}`;

    const confirmText =
      action === "accept"
        ? "Are you sure you want to approve this job?"
        : "Are you sure you want to reject this job?";

    if (!window.confirm(confirmText)) {
      return;
    }

    setActionLoading(actionKey);
    setError("");
    setSuccess("");

    try {
      const token = getToken();

      const response = await fetch(
        `${API_BASE}/api/jobs/admin/${id}/${action}`,
        {
          method: "PATCH",

          headers: {
            "Content-Type":
              "application/json",

            ...(token
              ? {
                  Authorization:
                    `Bearer ${token}`,
                }
              : {}),
          },
        }
      );

      let data = {};

      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (!response.ok) {
        throw new Error(
          data?.message ||
            (
              action === "accept"
                ? "Failed to approve job."
                : "Failed to reject job."
            )
        );
      }

      if (action === "accept") {
        setSuccess(
          "Job approved successfully. The user has been notified."
        );
      } else {
        setSuccess(
          "Job rejected successfully. The user has been notified."
        );
      }

      setSelectedJob(null);

      await loadJobs();
    } catch (err) {
      console.error(
        "Job action error:",
        err
      );

      setError(
        err?.message ||
          "Something went wrong."
      );
    } finally {
      setActionLoading("");
    }
  };

  // ============================================================
  // FILTER
  // ============================================================

  const filteredJobs = useMemo(() => {
    if (filter === "all") {
      return jobs;
    }

    return jobs.filter(
      (job) =>
        getStatus(job) === filter
    );
  }, [jobs, filter]);

  // ============================================================
  // COUNTS
  // ============================================================

  const pendingCount = useMemo(() => {
    return jobs.filter(
      (job) =>
        getStatus(job) === "pending"
    ).length;
  }, [jobs]);

  const approvedCount = useMemo(() => {
    return jobs.filter(
      (job) =>
        getStatus(job) === "approved"
    ).length;
  }, [jobs]);

  const rejectedCount = useMemo(() => {
    return jobs.filter(
      (job) =>
        getStatus(job) === "rejected"
    ).length;
  }, [jobs]);

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="admin-create-job-page">

      <div className="admin-create-job-container">

        {/* ======================================================
            HEADER
        ====================================================== */}

        <div className="admin-create-job-header">

          <div>

            <span className="admin-page-label">
              ADMIN PANEL
            </span>

            <h1>
              Job Approval
            </h1>

            <p>
              Review jobs submitted by users
              and approve or reject them.
            </p>

          </div>

          <button
            type="button"
            className="admin-refresh-btn"
            onClick={loadJobs}
            disabled={loading}
          >
            <span>
              ↻
            </span>

            {loading
              ? "Loading..."
              : "Refresh"}
          </button>

        </div>

        {/* ======================================================
            SUCCESS ALERT
        ====================================================== */}

        {success && (
          <div className="admin-alert success">

            <span className="alert-icon">
              ✓
            </span>

            <span>
              {success}
            </span>

            <button
              type="button"
              onClick={() =>
                setSuccess("")
              }
            >
              ×
            </button>

          </div>
        )}

        {/* ======================================================
            ERROR ALERT
        ====================================================== */}

        {error && (
          <div className="admin-alert error">

            <span className="alert-icon">
              !
            </span>

            <span>
              {error}
            </span>

            <button
              type="button"
              onClick={() =>
                setError("")
              }
            >
              ×
            </button>

          </div>
        )}

        {/* ======================================================
            STAT CARDS
        ====================================================== */}

        <div className="job-stat-grid">

          {/* PENDING */}

          <button
            type="button"
            className={`job-stat-card ${
              filter === "pending"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setFilter("pending")
            }
          >

            <div className="stat-icon pending-icon">
              ⏳
            </div>

            <div>

              <strong>
                {pendingCount}
              </strong>

              <span>
                Pending
              </span>

            </div>

          </button>

          {/* APPROVED */}

          <button
            type="button"
            className={`job-stat-card ${
              filter === "approved"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setFilter("approved")
            }
          >

            <div className="stat-icon approved-icon">
              ✓
            </div>

            <div>

              <strong>
                {approvedCount}
              </strong>

              <span>
                Approved
              </span>

            </div>

          </button>

          {/* REJECTED */}

          <button
            type="button"
            className={`job-stat-card ${
              filter === "rejected"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setFilter("rejected")
            }
          >

            <div className="stat-icon rejected-icon">
              ×
            </div>

            <div>

              <strong>
                {rejectedCount}
              </strong>

              <span>
                Rejected
              </span>

            </div>

          </button>

          {/* ALL */}

          <button
            type="button"
            className={`job-stat-card ${
              filter === "all"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setFilter("all")
            }
          >

            <div className="stat-icon total-icon">
              📋
            </div>

            <div>

              <strong>
                {jobs.length}
              </strong>

              <span>
                Total Jobs
              </span>

            </div>

          </button>

        </div>

        {/* ======================================================
            REQUEST SECTION
        ====================================================== */}

        <section className="job-request-section">

          <div className="section-header">

            <div>

              <h2>
                {filter === "pending"
                  ? "Pending Job Requests"
                  : filter === "approved"
                  ? "Approved Jobs"
                  : filter === "rejected"
                  ? "Rejected Jobs"
                  : "All Job Requests"}
              </h2>

              <p>
                User submitted jobs waiting
                for admin review.
              </p>

            </div>

            <span className="request-total">
              {filteredJobs.length}
            </span>

          </div>

          {/* ==================================================
              LOADING
          ================================================== */}

          {loading ? (

            <div className="job-loading">

              <div className="spinner"></div>

              <h3>
                Loading job requests...
              </h3>

              <p>
                Please wait.
              </p>

            </div>

          ) : filteredJobs.length === 0 ? (

            /* ==================================================
               EMPTY
            ================================================== */

            <div className="job-empty">

              <div className="empty-circle">
                ✓
              </div>

              <h3>
                No job requests found
              </h3>

              <p>
                There are no jobs in this
                section.
              </p>

              <button
                type="button"
                onClick={loadJobs}
              >
                Refresh Jobs
              </button>

            </div>

          ) : (

            /* ==================================================
               JOB LIST
            ================================================== */

            <div className="job-request-list">

              {filteredJobs.map(
                (job, index) => {

                  const id =
                    getJobId(job) ||
                    `job-${index}`;

                  const status =
                    getStatus(job);

                  const isPending =
                    status === "pending";

                  return (

                    <article
                      className="job-request-card"
                      key={id}
                    >

                      {/* ======================================
                          MAIN INFO
                      ====================================== */}

                      <div className="job-card-main">

                        <div className="job-card-icon">
                          💼
                        </div>

                        <div className="job-card-info">

                          <div className="job-title-line">

                            <h3>
                              {getJobTitle(job)}
                            </h3>

                            <span
                              className={`status-badge ${status}`}
                            >
                              {status}
                            </span>

                          </div>

                          <div className="job-category">

                            {getCategory(job)}

                            {getSubcategory(job) !== "-" && (
                              <>
                                {" • "}
                                {getSubcategory(job)}
                              </>
                            )}

                          </div>

                          <div className="job-user-info">

                            <span>
                              👤{" "}
                              {getCreator(job)}
                            </span>

                            <span>
                              ✉️{" "}
                              {getEmail(job)}
                            </span>

                            <span>
                              📅{" "}
                              {formatDate(
                                job?.createdAt ||
                                  job?.created_at
                              )}
                            </span>

                          </div>

                        </div>

                      </div>

                      {/* ======================================
                          VALUES
                      ====================================== */}

                      <div className="job-card-values">

                        <div className="job-value">

                          <span>
                            Workers
                          </span>

                          <strong>
                            {getWorkers(job)}
                          </strong>

                        </div>

                        <div className="job-value">

                          <span>
                            Worker Earn
                          </span>

                          <strong>
                            $
                            {getEarn(job).toFixed(
                              3
                            )}
                          </strong>

                        </div>

                        <div className="job-value">

                          <span>
                            Est. Cost
                          </span>

                          <strong>
                            $
                            {getCost(job).toFixed(
                              2
                            )}
                          </strong>

                        </div>

                      </div>

                      {/* ======================================
                          ACTIONS
                      ====================================== */}

                      <div className="job-card-actions">

                        <button
                          type="button"
                          className="view-btn"
                          onClick={() =>
                            setSelectedJob(job)
                          }
                        >
                          👁 View
                        </button>

                        {isPending && (
                          <>

                            {/* APPROVE */}

                            <button
                              type="button"
                              className="approve-btn"
                              disabled={
                                actionLoading ===
                                `accept-${id}`
                              }
                              onClick={() =>
                                handleAction(
                                  job,
                                  "accept"
                                )
                              }
                            >
                              {actionLoading ===
                              `accept-${id}`
                                ? "..."
                                : "✓ Approve"}
                            </button>

                            {/* REJECT */}

                            <button
                              type="button"
                              className="reject-btn"
                              disabled={
                                actionLoading ===
                                `reject-${id}`
                              }
                              onClick={() =>
                                handleAction(
                                  job,
                                  "reject"
                                )
                              }
                            >
                              {actionLoading ===
                              `reject-${id}`
                                ? "..."
                                : "× Reject"}
                            </button>

                          </>
                        )}

                      </div>

                    </article>

                  );
                }
              )}

            </div>

          )}

        </section>

      </div>

      {/* ========================================================
          JOB DETAILS MODAL
      ======================================================== */}

      {selectedJob && (

        <div
          className="job-modal-overlay"
          onClick={(event) => {

            if (
              event.target ===
              event.currentTarget
            ) {
              setSelectedJob(null);
            }

          }}
        >

          <div className="job-modal">

            {/* ================================================
                MODAL HEADER
            ================================================= */}

            <div className="job-modal-header">

              <div>

                <span>
                  JOB REQUEST DETAILS
                </span>

                <h2>
                  {getJobTitle(
                    selectedJob
                  )}
                </h2>

              </div>

              <button
                type="button"
                className="modal-close-btn"
                onClick={() =>
                  setSelectedJob(null)
                }
              >
                ×
              </button>

            </div>

            {/* ================================================
                MODAL BODY
            ================================================= */}

            <div className="job-modal-body">

              <div className="detail-grid">

                {/* CREATOR */}

                <div className="detail-item">

                  <span>
                    Creator
                  </span>

                  <strong>
                    {getCreator(
                      selectedJob
                    )}
                  </strong>

                </div>

                {/* EMAIL */}

                <div className="detail-item">

                  <span>
                    Email
                  </span>

                  <strong>
                    {getEmail(
                      selectedJob
                    )}
                  </strong>

                </div>

                {/* CATEGORY */}

                <div className="detail-item">

                  <span>
                    Category
                  </span>

                  <strong>
                    {getCategory(
                      selectedJob
                    )}
                  </strong>

                </div>

                {/* SUBCATEGORY */}

                <div className="detail-item">

                  <span>
                    Subcategory
                  </span>

                  <strong>
                    {getSubcategory(
                      selectedJob
                    )}
                  </strong>

                </div>

                {/* STATUS */}

                <div className="detail-item">

                  <span>
                    Status
                  </span>

                  <strong>
                    {getStatus(
                      selectedJob
                    )}
                  </strong>

                </div>

                {/* WORKERS */}

                <div className="detail-item">

                  <span>
                    Workers Needed
                  </span>

                  <strong>
                    {getWorkers(
                      selectedJob
                    )}
                  </strong>

                </div>

                {/* EARN */}

                <div className="detail-item">

                  <span>
                    Worker Earn
                  </span>

                  <strong>
                    $
                    {getEarn(
                      selectedJob
                    ).toFixed(3)}
                  </strong>

                </div>

                {/* COST */}

                <div className="detail-item">

                  <span>
                    Estimated Cost
                  </span>

                  <strong>
                    $
                    {getCost(
                      selectedJob
                    ).toFixed(2)}
                  </strong>

                </div>

                {/* LOCATION */}

                <div className="detail-item">

                  <span>
                    Location
                  </span>

                  <strong>
                    {getLocation(
                      selectedJob
                    )}
                  </strong>

                </div>

                {/* DEADLINE */}

                <div className="detail-item">

                  <span>
                    Deadline
                  </span>

                  <strong>
                    {formatDate(
                      getDeadline(
                        selectedJob
                      )
                    )}
                  </strong>

                </div>

                {/* SUBMITTED */}

                <div className="detail-item">

                  <span>
                    Submitted
                  </span>

                  <strong>
                    {formatDate(
                      selectedJob?.createdAt ||
                        selectedJob?.created_at
                    )}
                  </strong>

                </div>

              </div>

              {/* ==============================================
                  DESCRIPTION
              =============================================== */}

              <div className="detail-block">

                <h3>
                  Description
                </h3>

                <p>
                  {getDescription(
                    selectedJob
                  )}
                </p>

              </div>

              {/* ==============================================
                  TASKS
              =============================================== */}

              <div className="detail-block">

                <h3>
                  Tasks
                </h3>

                {getTasks(
                  selectedJob
                ).length > 0 ? (

                  <ol className="task-list">

                    {getTasks(
                      selectedJob
                    ).map(
                      (task, index) => (

                        <li
                          key={index}
                        >
                          {typeof task ===
                          "string"
                            ? task
                            : task?.text ||
                              task?.description ||
                              task?.title ||
                              JSON.stringify(
                                task
                              )}
                        </li>

                      )
                    )}

                  </ol>

                ) : (

                  <p>
                    No tasks provided.
                  </p>

                )}

              </div>

              {/* ==============================================
                  PROOF
              =============================================== */}

              <div className="detail-block">

                <h3>
                  Required Proof
                </h3>

                <p>
                  {getProof(
                    selectedJob
                  )}
                </p>

              </div>

            </div>

            {/* ================================================
                MODAL ACTIONS
            ================================================= */}

            {getStatus(
              selectedJob
            ) === "pending" && (

              <div className="modal-actions">

                {/* REJECT */}

                <button
                  type="button"
                  className="reject-btn large"
                  disabled={
                    actionLoading ===
                    `reject-${getJobId(
                      selectedJob
                    )}`
                  }
                  onClick={() =>
                    handleAction(
                      selectedJob,
                      "reject"
                    )
                  }
                >
                  {actionLoading ===
                  `reject-${getJobId(
                    selectedJob
                  )}`
                    ? "..."
                    : "× Reject Job"}
                </button>

                {/* APPROVE */}

                <button
                  type="button"
                  className="approve-btn large"
                  disabled={
                    actionLoading ===
                    `accept-${getJobId(
                      selectedJob
                    )}`
                  }
                  onClick={() =>
                    handleAction(
                      selectedJob,
                      "accept"
                    )
                  }
                >
                  {actionLoading ===
                  `accept-${getJobId(
                    selectedJob
                  )}`
                    ? "..."
                    : "✓ Approve Job"}
                </button>

              </div>

            )}

          </div>

        </div>

      )}

    </div>
  );
};

export default AdminCreateJob;