import React, {
  useEffect,
  useMemo,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import "./Jobs.css";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://work-up-home.onrender.com/api";

function getToken() {
  return (
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    sessionStorage.getItem("token") ||
    ""
  );
}

function authHeaders() {
  const token = getToken();

  return {
    "Content-Type": "application/json",
    ...(token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {}),
  };
}

export default function Jobs() {
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const [selectedJob, setSelectedJob] = useState(null);

  const [proofText, setProofText] = useState("");
  const [proofImages, setProofImages] = useState([]);

  const [submitting, setSubmitting] = useState(false);

  /*
  =========================================================
  LOAD JOBS
  =========================================================
  */

  const loadJobs = async () => {
    try {
      setLoading(true);
      setError("");

      const token = getToken();

      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/jobs`,
        {
          method: "GET",
          headers: authHeaders(),
        }
      );

      const data = await response
        .json()
        .catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to load jobs."
        );
      }

      const list = Array.isArray(data.data)
        ? data.data
        : Array.isArray(data.jobs)
        ? data.jobs
        : [];

      /*
        Full jobs should never appear.
      */

      const available = list.filter((job) => {
        const need = Number(
          job.workerNeed || 0
        );

        const completed = Number(
          job.completedWorkers ||
            job.startedWorkers ||
            0
        );

        if (
          need > 0 &&
          completed >= need
        ) {
          return false;
        }

        return true;
      });

      setJobs(available);
    } catch (err) {
      console.error(
        "Load jobs error:",
        err
      );

      setError(
        err.message ||
          "Unable to load available jobs."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  /*
  =========================================================
  CATEGORIES
  =========================================================
  */

  const categories = useMemo(() => {
    const values = jobs
      .map((job) => job.category)
      .filter(Boolean);

    return [
      "All",
      ...Array.from(new Set(values)),
    ];
  }, [jobs]);

  /*
  =========================================================
  FILTER
  =========================================================
  */

  const filteredJobs = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase();

    return jobs.filter((job) => {
      const title = String(
        job.title ||
          job.jobTitle ||
          ""
      ).toLowerCase();

      const jobCategory = String(
        job.category || ""
      ).toLowerCase();

      const subcategory = String(
        job.subcategory || ""
      ).toLowerCase();

      const matchesSearch =
        !query ||
        title.includes(query) ||
        jobCategory.includes(query) ||
        subcategory.includes(query);

      const matchesCategory =
        category === "All" ||
        String(
          job.category || ""
        ) === category;

      return (
        matchesSearch &&
        matchesCategory
      );
    });
  }, [
    jobs,
    search,
    category,
  ]);

  /*
  =========================================================
  OPEN JOB
  =========================================================
  */

  const openJob = (job) => {
    setSelectedJob(job);
    setProofText("");
    setProofImages([]);
    setError("");
  };

  /*
  =========================================================
  CLOSE JOB
  =========================================================
  */

  const closeJob = () => {
    if (submitting) {
      return;
    }

    setSelectedJob(null);
    setProofText("");
    setProofImages([]);
  };

  /*
  =========================================================
  IMAGE PROOF
  =========================================================
  */

  const handleProofImages = (
    event
  ) => {
    const files = Array.from(
      event.target.files || []
    );

    const validFiles = files.filter(
      (file) =>
        file.type.startsWith("image/") &&
        file.size <=
          5 * 1024 * 1024
    );

    setProofImages(validFiles);
  };

  /*
  =========================================================
  SUBMIT WORK
  =========================================================
  */

  const handleSubmitJob = async () => {
    if (!selectedJob) {
      return;
    }

    if (
      !proofText.trim() &&
      proofImages.length === 0
    ) {
      setError(
        "Please provide proof before submitting."
      );

      return;
    }

    const jobId =
      selectedJob.id ||
      selectedJob._id;

    if (!jobId) {
      setError(
        "Job ID is missing."
      );

      return;
    }

    try {
      setSubmitting(true);
      setError("");
      setSuccess("");

      const imageData =
        proofImages.map(
          (file) => ({
            name: file.name,
            type: file.type,
            size: file.size,
          })
        );

      const response =
        await fetch(
          `${API_BASE_URL}/jobs/${jobId}/submit`,
          {
            method: "POST",
            headers:
              authHeaders(),

            body: JSON.stringify({
              proofText:
                proofText.trim(),

              proofImages:
                imageData,
            }),
          }
        );

      const data =
        await response
          .json()
          .catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to submit work."
        );
      }

      setSelectedJob(null);
      setProofText("");
      setProofImages([]);

      setSuccess(
        data.message ||
          "Work submitted successfully!"
      );

      await loadJobs();
    } catch (err) {
      console.error(
        "Submit work error:",
        err
      );

      setError(
        err.message ||
          "Unable to submit work."
      );
    } finally {
      setSubmitting(false);
    }
  };

  /*
  =========================================================
  HELPERS
  =========================================================
  */

  const getTitle = (job) =>
    job.title ||
    job.jobTitle ||
    "Untitled Job";

  const getId = (job) =>
    job.id ||
    job._id;

  const getThumbnail = (job) => {
    if (
      typeof job.thumbnail ===
        "string" &&
      job.thumbnail
    ) {
      return job.thumbnail;
    }

    if (
      job.thumbnail &&
      typeof job.thumbnail ===
        "object" &&
      job.thumbnail.url
    ) {
      return job.thumbnail.url;
    }

    return "";
  };

  const getWorkerNeed = (job) =>
    Number(
      job.workerNeed || 0
    );

  const getCompletedWorkers = (
    job
  ) =>
    Number(
      job.completedWorkers ||
        job.startedWorkers ||
        0
    );

  const getWorkerRate = (job) =>
    Number(
      job.workerEarn ??
        job.workerReward ??
        0
    );

  const getProgress = (job) => {
    const need =
      getWorkerNeed(job);

    const completed =
      getCompletedWorkers(job);

    if (need <= 0) {
      return 0;
    }

    return Math.min(
      100,
      Math.max(
        0,
        (completed / need) * 100
      )
    );
  };

  /*
  =========================================================
  PLATFORM HELPERS
  =========================================================
  */

  const getPlatform = (job) => {
    const value = String(
      job.platform ||
        job.socialPlatform ||
        job.accountType ||
        job.subcategory ||
        job.category ||
        ""
    )
      .trim()
      .toLowerCase();

    if (
      value.includes("gmail") ||
      value.includes("google") ||
      value.includes("email")
    ) {
      return "Gmail";
    }

    if (
      value.includes("facebook") ||
      value.includes("fb")
    ) {
      return "Facebook";
    }

    if (
      value.includes("instagram") ||
      value.includes("insta")
    ) {
      return "Instagram";
    }

    return "";
  };

  const getPlatformData = (job) => {
    const platform =
      getPlatform(job);

    const account =
      job.account ||
      job.credentials ||
      job.login ||
      {};

    const email =
      job.email ||
      job.gmail ||
      job.gmailAddress ||
      job.accountEmail ||
      account.email ||
      account.gmail ||
      "";

    const username =
      job.username ||
      job.instagramUsername ||
      job.facebookUsername ||
      account.username ||
      "";

    const description =
      job.description ||
      job.accountDescription ||
      job.platformDescription ||
      job.note ||
      "";

    return {
      platform,
      email,
      username,
      description,
    };
  };

  /*
  =========================================================
  LOADING
  =========================================================
  */

  if (loading) {
    return (
      <div className="jobs-page">
        <div className="jobs-container">
          <div className="jobs-loading">
            <div className="jobs-spinner" />

            <p>
              Loading available jobs...
            </p>
          </div>
        </div>
      </div>
    );
  }

  /*
  =========================================================
  PAGE
  =========================================================
  */

  return (
    <div className="jobs-page">
      <div className="jobs-container">

        {/* HEADER */}

        <div className="jobs-header">
          <div className="jobs-header-left">

            <span className="jobs-eyebrow">
              WORK UP HOME
            </span>

            <h1>
              Available Jobs
            </h1>

            <p>
              Complete available tasks
              and earn money.
            </p>

          </div>

          <div className="jobs-count">
            <strong>
              {filteredJobs.length}
            </strong>

            <span>
              Available Jobs
            </span>
          </div>
        </div>

        {/* SEARCH */}

        <div className="jobs-toolbar">

          <div className="jobs-search">

            <span className="jobs-search-icon">
              ⌕
            </span>

            <input
              type="text"
              placeholder="Search jobs..."
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
            />

            {search && (
              <button
                type="button"
                className="jobs-search-clear"
                onClick={() =>
                  setSearch("")
                }
              >
                ×
              </button>
            )}

          </div>

          <div className="jobs-category-filter">

            <select
              value={category}
              onChange={(e) =>
                setCategory(
                  e.target.value
                )
              }
            >
              {categories.map(
                (item) => (
                  <option
                    key={item}
                    value={item}
                  >
                    {item}
                  </option>
                )
              )}
            </select>

          </div>

        </div>

        {/* ERROR */}

        {error && (
          <div className="jobs-error">
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

        {/* SUCCESS */}

        {success && (
          <div className="jobs-success">
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

        {/* EMPTY */}

        {filteredJobs.length === 0 ? (
          <div className="jobs-empty">

            <div className="jobs-empty-icon">
              ✓
            </div>

            <h2>
              No jobs found
            </h2>

            <p>
              There are no available
              jobs matching your search.
            </p>

            {(search ||
              category !== "All") && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setCategory("All");
                }}
              >
                Clear Filters
              </button>
            )}

          </div>
        ) : (

          /* JOB LIST */

          <div className="jobs-grid">

            {filteredJobs.map(
              (job) => {

                const jobId =
                  getId(job);

                const title =
                  getTitle(job);

                const workerNeed =
                  getWorkerNeed(job);

                const completed =
                  getCompletedWorkers(
                    job
                  );

                const rate =
                  getWorkerRate(job);

                const progress =
                  getProgress(job);

                return (
                  <article
                    key={jobId}
                    className="job-row-card"
                    onClick={() =>
                      openJob(job)
                    }
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (
                        e.key ===
                          "Enter" ||
                        e.key === " "
                      ) {
                        e.preventDefault();
                        openJob(job);
                      }
                    }}
                  >

                    {/* TITLE */}

                    <div className="job-row-title-line">

                      <span className="job-row-title">
                        {title}
                      </span>

                      <span className="job-row-top-badge">
                        TOP JOB
                      </span>

                    </div>

                    {/* PROGRESS */}

                    <div className="job-row-bottom">

                      <div className="job-row-progress-wrap">

                        <span className="job-row-count">
                          {completed} OF{" "}
                          {workerNeed}
                        </span>

                        <div className="job-row-progress-track">

                          <div
                            className="job-row-progress-fill"
                            style={{
                              width:
                                `${progress}%`,
                            }}
                          />

                        </div>

                      </div>

                      <div className="job-row-rate">
                        {rate.toFixed(3)} S
                      </div>

                    </div>

                  </article>
                );
              }
            )}

          </div>
        )}

      </div>

      {/* =====================================================
          JOB DETAILS MODAL
      ===================================================== */}

      {selectedJob && (
        <div
          className="job-modal-overlay"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeJob();
            }
          }}
        >

          <div className="job-modal">

            {/* HEADER */}

            <div className="job-modal-header">

              <div>

                <span className="jobs-eyebrow">
                  JOB DETAILS
                </span>

                <h2>
                  {getTitle(
                    selectedJob
                  )}
                </h2>

              </div>

              <button
                type="button"
                className="job-modal-close"
                onClick={closeJob}
                disabled={submitting}
              >
                ×
              </button>

            </div>

            {/* BODY */}

            <div className="job-modal-body">

              {/* CATEGORY */}

              <div className="job-modal-tags">

                <span>
                  {selectedJob.category ||
                    "Other"}
                </span>

                <span>
                  {selectedJob.subcategory ||
                    "General"}
                </span>

              </div>

              {/* =================================================
                  PLATFORM DETAILS
              ================================================= */}

              {(() => {
                const platformData =
                  getPlatformData(
                    selectedJob
                  );

                if (
                  !platformData.platform
                ) {
                  return null;
                }

                return (
                  <div className="job-platform-box">

                    <div className="job-platform-heading">

                      <div>
                        <span className="job-platform-label">
                          ACCOUNT DETAILS
                        </span>

                        <h3>
                          {platformData.platform}
                        </h3>
                      </div>

                      <span className="job-platform-pill">
                        {platformData.platform}
                      </span>

                    </div>

                    <div className="job-platform-fields">

                      {/* GMAIL */}

                      {platformData.platform ===
                        "Gmail" && (
                        <>
                          <div className="job-platform-field">

                            <label>
                              Gmail
                            </label>

                            <div className="job-platform-value">
                              {platformData.email ||
                                "No Gmail provided"}
                            </div>

                          </div>

                          <div className="job-platform-field">

                            <label>
                              Password
                            </label>

                            <div className="job-platform-value job-password-hidden">
                              Hidden for security
                            </div>

                          </div>
                        </>
                      )}

                      {/* FACEBOOK */}

                      {platformData.platform ===
                        "Facebook" && (
                        <>
                          <div className="job-platform-field">

                            <label>
                              Facebook
                            </label>

                            <div className="job-platform-value">
                              {platformData.username ||
                                platformData.email ||
                                "No Facebook account provided"}
                            </div>

                          </div>

                          <div className="job-platform-field">

                            <label>
                              Password
                            </label>

                            <div className="job-platform-value job-password-hidden">
                              Hidden for security
                            </div>

                          </div>
                        </>
                      )}

                      {/* INSTAGRAM */}

                      {platformData.platform ===
                        "Instagram" && (
                        <>
                          <div className="job-platform-field">

                            <label>
                              Instagram
                            </label>

                            <div className="job-platform-value">
                              {platformData.username ||
                                platformData.email ||
                                "No Instagram account provided"}
                            </div>

                          </div>

                          <div className="job-platform-field">

                            <label>
                              Password
                            </label>

                            <div className="job-platform-value job-password-hidden">
                              Hidden for security
                            </div>

                          </div>
                        </>
                      )}

                    </div>

                    {/* DESCRIPTION */}

                    <div className="job-platform-description">

                      <h4>
                        Description
                      </h4>

                      <p>
                        {platformData.description ||
                          "No description provided."}
                      </p>

                    </div>

                  </div>
                );
              })()}

              {/* INSTRUCTIONS */}

              {selectedJob.note && (
                <div className="job-detail-block">

                  <h3>
                    Job Instructions
                  </h3>

                  <p>
                    {selectedJob.note}
                  </p>

                </div>
              )}

              {/* TASKS */}

              <div className="job-detail-block">

                <h3>
                  Tasks to Complete
                </h3>

                <div className="job-task-details">

                  {Array.isArray(
                    selectedJob.tasks
                  ) &&
                  selectedJob.tasks.length >
                    0 ? (

                    selectedJob.tasks.map(
                      (
                        task,
                        index
                      ) => (

                        <div
                          key={index}
                          className="job-task-detail"
                        >

                          <span>
                            {index + 1}
                          </span>

                          <p>
                            {task}
                          </p>

                        </div>

                      )
                    )

                  ) : (

                    <p>
                      Follow the job
                      instructions.
                    </p>

                  )}

                </div>

              </div>

              {/* REQUIRED PROOF */}

              <div className="job-proof-requirement">

                <h3>
                  Required Proof
                </h3>

                <p>
                  {selectedJob.proof ||
                    "Submit proof of completed work."}
                </p>

              </div>

              {/* STATS */}

              <div className="job-modal-stats">

                <div>

                  <span>
                    Rate
                  </span>

                  <strong>
                    {Number(
                      selectedJob.workerEarn ??
                        selectedJob.workerReward ??
                        0
                    ).toFixed(3)}
                  </strong>

                </div>

                <div>

                  <span>
                    Workers
                  </span>

                  <strong>
                    {Number(
                      selectedJob.workerNeed ||
                        0
                    )}
                  </strong>

                </div>

                <div>

                  <span>
                    Days
                  </span>

                  <strong>
                    {Number(
                      selectedJob.estimatedDay ||
                        1
                    )}
                  </strong>

                </div>

              </div>

              {/* SUBMIT WORK */}

              <div className="job-detail-block">

                <h3>
                  Submit Your Work
                </h3>

                <p className="job-submit-help">
                  Complete the task and
                  provide your proof.
                </p>

                <textarea
                  rows={6}
                  value={proofText}
                  disabled={submitting}
                  onChange={(e) =>
                    setProofText(
                      e.target.value
                    )
                  }
                  placeholder="Write your proof here..."
                />

                {/* PROOF SCREENSHOTS */}

                <label className="job-proof-upload">

                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    disabled={submitting}
                    onChange={
                      handleProofImages
                    }
                  />

                  <span>
                    + Add Proof Screenshots
                  </span>

                </label>

                {proofImages.length >
                  0 && (
                  <div className="job-proof-files">

                    {proofImages.map(
                      (
                        file,
                        index
                      ) => (

                        <div
                          key={`${file.name}-${index}`}
                        >
                          {file.name}
                        </div>

                      )
                    )}

                  </div>
                )}

              </div>

            </div>

            {/* FOOTER */}

            <div className="job-modal-footer">

              <button
                type="button"
                className="job-modal-cancel"
                disabled={submitting}
                onClick={closeJob}
              >
                Cancel
              </button>

              <button
                type="button"
                className="job-modal-submit"
                disabled={submitting}
                onClick={
                  handleSubmitJob
                }
              >
                {submitting
                  ? "Submitting..."
                  : "Submit Work"}
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}