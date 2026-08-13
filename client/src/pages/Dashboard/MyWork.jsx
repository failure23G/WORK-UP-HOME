import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./MyWork.css";

const API_URL = "http://localhost:5000";

function MyWork() {
  const navigate = useNavigate();

  const [works, setWorks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("pending");

  const fetchMyWork = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Please login first.");
      }

      const response = await fetch(`${API_URL}/api/jobs/my-work`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      console.log("MY WORK API RESPONSE:", data);

      if (!response.ok) {
        throw new Error(
          data?.message || "Failed to load your work"
        );
      }

      /*
        Backend response:

        {
          success: true,
          data: {
            pending: [],
            satisfy: [],
            unsatisfy: [],
            all: []
          }
        }
      */

      let workList = [];

      if (Array.isArray(data)) {
        workList = data;
      } else if (Array.isArray(data?.data?.all)) {
        workList = data.data.all;
      } else if (Array.isArray(data?.data?.pending)) {
        workList = [
          ...(data.data.pending || []),
          ...(data.data.satisfy || []),
          ...(data.data.unsatisfy || []),
        ];
      } else if (Array.isArray(data?.submissions)) {
        workList = data.submissions;
      } else if (Array.isArray(data?.works)) {
        workList = data.works;
      } else if (Array.isArray(data?.jobs)) {
        workList = data.jobs;
      }

      setWorks(workList);
    } catch (err) {
      console.error("My Work Error:", err);

      setError(
        err?.message || "Something went wrong while loading your work."
      );

      setWorks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyWork();
  }, []);

  /*
  ============================================================
  STATUS
  ============================================================
  */

  const getStatus = (work) => {
    const status = String(
      work?.status ||
        work?.reviewStatus ||
        work?.submissionStatus ||
        "pending"
    ).toLowerCase();

    if (status === "satisfied") {
      return "satisfy";
    }

    if (status === "unsatisfied") {
      return "unsatisfy";
    }

    return status;
  };

  /*
  ============================================================
  FILTER
  ============================================================
  */

  const pendingWorks = works.filter(
    (work) => getStatus(work) === "pending"
  );

  const satisfyWorks = works.filter(
    (work) => getStatus(work) === "satisfy"
  );

  const unsatisfyWorks = works.filter(
    (work) => getStatus(work) === "unsatisfy"
  );

  const getVisibleWorks = () => {
    if (activeTab === "pending") {
      return pendingWorks;
    }

    if (activeTab === "satisfy") {
      return satisfyWorks;
    }

    if (activeTab === "unsatisfy") {
      return unsatisfyWorks;
    }

    return works;
  };

  const visibleWorks = getVisibleWorks();

  /*
  ============================================================
  JOB TITLE
  ============================================================
  */

  const getJobTitle = (work) => {
    return (
      work?.job?.title ||
      work?.job?.name ||
      work?.title ||
      work?.jobTitle ||
      "Untitled Job"
    );
  };

  /*
  ============================================================
  DESCRIPTION
  ============================================================
  */

  const getJobDescription = (work) => {
    return (
      work?.job?.description ||
      work?.description ||
      work?.proofText ||
      "No description available."
    );
  };

  /*
  ============================================================
  REWARD
  ============================================================
  */

  const getAmount = (work) => {
    const amount =
      work?.earningUsd ??
      work?.job?.workerEarn ??
      work?.job?.reward ??
      work?.job?.amount ??
      work?.reward ??
      work?.amount ??
      0;

    return Number(amount);
  };

  /*
  ============================================================
  DATE
  ============================================================
  */

  const getDate = (work) => {
    const date =
      work?.submittedAt ||
      work?.createdAt ||
      work?.updatedAt;

    if (!date) {
      return "Recently";
    }

    try {
      return new Date(date).toLocaleString();
    } catch {
      return "Recently";
    }
  };

  /*
  ============================================================
  PROOF
  ============================================================
  */

  const getProof = (work) => {
    return (
      work?.proofText ||
      work?.proof ||
      work?.submissionText ||
      ""
    );
  };

  /*
  ============================================================
  STATUS CLASS
  ============================================================
  */

  const getStatusClass = (work) => {
    const status = getStatus(work);

    if (status === "satisfy") {
      return "status-satisfy";
    }

    if (status === "unsatisfy") {
      return "status-unsatisfy";
    }

    return "status-pending";
  };

  /*
  ============================================================
  STATUS TEXT
  ============================================================
  */

  const getStatusText = (work) => {
    const status = getStatus(work);

    if (status === "satisfy") {
      return "Approved";
    }

    if (status === "unsatisfy") {
      return "Rejected";
    }

    return "Pending Review";
  };

  /*
  ============================================================
  RENDER
  ============================================================
  */

  return (
    <div className="my-work-page">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="my-work-header">
        <div>
          <span className="section-label">
            WORK UP HOME
          </span>

          <h1>My Work</h1>

          <p>
            Track all jobs you have submitted and their review status.
          </p>
        </div>

        <button
          className="refresh-btn"
          onClick={fetchMyWork}
          disabled={loading}
        >
          <span>↻</span>

          {loading
            ? "Refreshing..."
            : "Refresh"}
        </button>
      </div>

      {/* =====================================================
          STATISTICS
      ===================================================== */}

      <div className="work-stats">

        {/* PENDING */}

        <button
          type="button"
          className={`stat-card pending-card ${
            activeTab === "pending"
              ? "active"
              : ""
          }`}
          onClick={() =>
            setActiveTab("pending")
          }
        >
          <div className="stat-icon">
            ⏳
          </div>

          <div className="stat-content">
            <span>Pending</span>

            <strong>
              {pendingWorks.length}
            </strong>
          </div>
        </button>

        {/* APPROVED */}

        <button
          type="button"
          className={`stat-card satisfy-card ${
            activeTab === "satisfy"
              ? "active"
              : ""
          }`}
          onClick={() =>
            setActiveTab("satisfy")
          }
        >
          <div className="stat-icon">
            ✓
          </div>

          <div className="stat-content">
            <span>Satisfy</span>

            <strong>
              {satisfyWorks.length}
            </strong>
          </div>
        </button>

        {/* REJECTED */}

        <button
          type="button"
          className={`stat-card unsatisfy-card ${
            activeTab === "unsatisfy"
              ? "active"
              : ""
          }`}
          onClick={() =>
            setActiveTab("unsatisfy")
          }
        >
          <div className="stat-icon">
            !
          </div>

          <div className="stat-content">
            <span>Unsatisfy</span>

            <strong>
              {unsatisfyWorks.length}
            </strong>
          </div>
        </button>

      </div>

      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <div className="work-error">
          <span>!</span>

          <div>
            <strong>
              Unable to load your work
            </strong>

            <p>
              {error}
            </p>
          </div>
        </div>
      )}

      {/* =====================================================
          LOADING
      ===================================================== */}

      {loading ? (
        <div className="work-loading">
          <div className="loading-spinner"></div>

          <p>
            Loading your work...
          </p>
        </div>
      ) : visibleWorks.length === 0 ? (

        /* =================================================
           EMPTY STATE
        ================================================= */

        <div className="empty-work">

          <div className="empty-icon">
            {activeTab === "pending"
              ? "⏳"
              : activeTab === "satisfy"
              ? "✓"
              : "!"}
          </div>

          <h2>
            {activeTab === "pending"
              ? "No Pending Work"
              : activeTab === "satisfy"
              ? "No Approved Work"
              : "No Rejected Work"}
          </h2>

          <p>
            {activeTab === "pending"
              ? "Jobs you submit will appear here while waiting for the creator to review them."
              : activeTab === "satisfy"
              ? "Your approved jobs will appear here."
              : "Your rejected jobs will appear here."}
          </p>

          {activeTab === "pending" && (
            <button
              type="button"
              className="find-jobs-btn"
              onClick={() =>
                navigate("/dashboard/jobs")
              }
            >
              Find Jobs
              <span>→</span>
            </button>
          )}

        </div>

      ) : (

        /* =================================================
           WORK LIST
        ================================================= */

        <div className="work-list">

          <div className="work-list-header">

            <div>
              <span className="list-label">
                {activeTab === "pending"
                  ? "PENDING REVIEW"
                  : activeTab === "satisfy"
                  ? "APPROVED"
                  : "REJECTED"}
              </span>

              <h2>
                {visibleWorks.length}{" "}
                {visibleWorks.length === 1
                  ? "Job"
                  : "Jobs"}
              </h2>
            </div>

          </div>

          <div className="work-grid">

            {visibleWorks.map(
              (work, index) => {

                const status =
                  getStatus(work);

                const proof =
                  getProof(work);

                return (
                  <div
                    className="work-card"
                    key={
                      work?._id ||
                      work?.id ||
                      index
                    }
                  >

                    {/* =================================================
                        CARD TOP
                    ================================================= */}

                    <div className="work-card-top">

                      <div className="job-icon">
                        💼
                      </div>

                      <span
                        className={`work-status ${getStatusClass(
                          work
                        )}`}
                      >
                        {getStatusText(work)}
                      </span>

                    </div>

                    {/* =================================================
                        JOB TITLE
                    ================================================= */}

                    <h3>
                      {getJobTitle(work)}
                    </h3>

                    {/* =================================================
                        DESCRIPTION
                    ================================================= */}

                    <p className="work-description">
                      {getJobDescription(work)}
                    </p>

                    {/* =================================================
                        INFORMATION
                    ================================================= */}

                    <div className="work-info">

                      <div className="info-item">

                        <span className="info-label">
                          Your Earning
                        </span>

                        <strong>
                          $
                          {getAmount(work).toFixed(
                            3
                          )}
                        </strong>

                      </div>

                      <div className="info-item">

                        <span className="info-label">
                          Submitted
                        </span>

                        <strong>
                          {getDate(work)}
                        </strong>

                      </div>

                    </div>

                    {/* =================================================
                        PROOF
                    ================================================= */}

                    {proof && (
                      <div className="review-note">

                        <span>
                          📝
                        </span>

                        <div>
                          <strong>
                            Your Submitted Proof
                          </strong>

                          <p>
                            {proof}
                          </p>
                        </div>

                      </div>
                    )}

                    {/* =================================================
                        REVIEW NOTE
                    ================================================= */}

                    {work?.reviewNote && (
                      <div className="review-note">

                        <span>
                          💬
                        </span>

                        <div>
                          <strong>
                            Creator Review
                          </strong>

                          <p>
                            {work.reviewNote}
                          </p>
                        </div>

                      </div>
                    )}

                    {/* =================================================
                        CURRENT STATUS MESSAGE
                    ================================================= */}

                    <div
                      className={`submission-status-box ${getStatusClass(
                        work
                      )}`}
                    >

                      {status === "pending" && (
                        <>
                          <strong>
                            ⏳ Waiting for review
                          </strong>

                          <p>
                            Your work has been submitted successfully.
                            The job creator will review it.
                          </p>
                        </>
                      )}

                      {status === "satisfy" && (
                        <>
                          <strong>
                            ✓ Work Approved
                          </strong>

                          <p>
                            The job creator approved your work.
                            Your earning is now approved.
                          </p>
                        </>
                      )}

                      {status === "unsatisfy" && (
                        <>
                          <strong>
                            ✕ Work Rejected
                          </strong>

                          <p>
                            The job creator rejected your submitted work.
                          </p>
                        </>
                      )}

                    </div>

                  </div>
                );
              }
            )}

          </div>

        </div>
      )}

    </div>
  );
}

export default MyWork;