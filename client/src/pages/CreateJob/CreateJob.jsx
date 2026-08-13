import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CreateJob.css";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const initialForm = {
  category: "",
  subcategory: "",
  jobTitle: "",
  note: "",
  tasks: [""],
  proof: "",
  workerNeed: 1,
  workerEarn: "",
  screenshots: 0,
  estimatedDay: 1,
  boostPeriod: "None",
  scheduleTime: "",
  estimatedCost: "",
  thumbnail: null,
  isTopJob: false,
};

const categoryOptions = [
  "Social Media",
  "YouTube",
  "Facebook",
  "Instagram",
  "TikTok",
  "Telegram",
  "Website",
  "App",
  "Survey",
  "Data Entry",
   "Gmail",
  "Other",
];



const subcategoryOptions = {
  "Social Media": [
    "Like",
    "Follow",
    "Comment",
    "Share",
    "Review",
  ],
  YouTube: [
    "Subscribe",
    "Like",
    "Comment",
    "Watch Video",
  ],
  Facebook: [
    "Like",
    "Follow",
    "Comment",
    "Share",
    "Review",
  ],
  Instagram: [
    "Follow",
    "Like",
    "Comment",
    "Save",
  ],
  TikTok: [
    "Follow",
    "Like",
    "Comment",
    "Watch Video",
  ],
  Telegram: [
    "Join Channel",
    "Join Group",
    "View Post",
  ],
  Website: [
    "Visit Website",
    "Register",
    "Review",
    "Test Website",
  ],
  App: [
    "Install App",
    "Register",
    "Test App",
    "Review",
  ],
  Survey: [
    "Complete Survey",
    "Answer Questions",
  ],
  "Data Entry": [
    "Data Entry",
    "Copy Data",
    "Typing",
  ],
 Gmail: [
       "New",
       "Old",
   ],
  Other: [
    "Other",
  ],

};

function getToken() {
  return (
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    sessionStorage.getItem("token") ||
    ""
  );
}

function getAuthHeaders() {
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

function CreateJob() {
  const navigate = useNavigate();

  const [form, setForm] = useState(initialForm);

  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState("");

  const [error, setError] = useState("");

  const [thumbnailPreview, setThumbnailPreview] =
    useState("");

  const subcategories = useMemo(() => {
    return (
      subcategoryOptions[form.category] || [
        "Other",
      ]
    );
  }, [form.category]);

  /*
  ============================================================
  AUTO CALCULATE ESTIMATED COST
  ============================================================
  */

  useEffect(() => {
    const workers = Number(form.workerNeed) || 0;

    const earning = Number(form.workerEarn) || 0;

    const cost = workers * earning;

    setForm((previous) => ({
      ...previous,
      estimatedCost:
        cost > 0 ? cost.toFixed(3) : "",
    }));
  }, [form.workerNeed, form.workerEarn]);

  /*
  ============================================================
  CLEANUP THUMBNAIL PREVIEW
  ============================================================
  */

  useEffect(() => {
    return () => {
      if (thumbnailPreview) {
        URL.revokeObjectURL(thumbnailPreview);
      }
    };
  }, [thumbnailPreview]);

  /*
  ============================================================
  INPUT CHANGE
  ============================================================
  */

  const handleChange = (event) => {
    const { name, value, type, checked } =
      event.target;

    setError("");
    setMessage("");

    setForm((previous) => ({
      ...previous,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));

    /*
    ----------------------------------------------------------
    CATEGORY CHANGE
    ----------------------------------------------------------
    */

    if (name === "category") {
      setForm((previous) => ({
        ...previous,
        category: value,
        subcategory: "",
      }));
    }
  };

  /*
  ============================================================
  TASK CHANGE
  ============================================================
  */

  const handleTaskChange = (
    index,
    value
  ) => {
    setError("");
    setMessage("");

    setForm((previous) => {
      const updatedTasks = [
        ...previous.tasks,
      ];

      updatedTasks[index] = value;

      return {
        ...previous,
        tasks: updatedTasks,
      };
    });
  };

  /*
  ============================================================
  ADD TASK
  ============================================================
  */

  const addTask = () => {
    setForm((previous) => ({
      ...previous,

      tasks: [
        ...previous.tasks,
        "",
      ],
    }));
  };

  /*
  ============================================================
  REMOVE TASK
  ============================================================
  */

  const removeTask = (index) => {
    setForm((previous) => {
      if (previous.tasks.length === 1) {
        return previous;
      }

      return {
        ...previous,

        tasks: previous.tasks.filter(
          (_, taskIndex) =>
            taskIndex !== index
        ),
      };
    });
  };

  /*
  ============================================================
  THUMBNAIL SELECT
  ============================================================
  */

  const handleThumbnailChange = (
    event
  ) => {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    setError("");
    setMessage("");

    /*
    ----------------------------------------------------------
    5MB MAX
    ----------------------------------------------------------
    */

    if (
      file.size >
      5 * 1024 * 1024
    ) {
      setError(
        "Thumbnail must be smaller than 5MB."
      );

      event.target.value = "";

      return;
    }

    /*
    ----------------------------------------------------------
    IMAGE ONLY
    ----------------------------------------------------------
    */

    if (
      !file.type.startsWith(
        "image/"
      )
    ) {
      setError(
        "Please select an image file."
      );

      event.target.value = "";

      return;
    }

    /*
    ----------------------------------------------------------
    PREVIOUS PREVIEW CLEAN
    ----------------------------------------------------------
    */

    if (thumbnailPreview) {
      URL.revokeObjectURL(
        thumbnailPreview
      );
    }

    const preview =
      URL.createObjectURL(file);

    setThumbnailPreview(preview);

    setForm((previous) => ({
      ...previous,

      thumbnail: file,
    }));
  };

  /*
  ============================================================
  REMOVE THUMBNAIL
  ============================================================
  */

  const removeThumbnail = () => {
    if (thumbnailPreview) {
      URL.revokeObjectURL(
        thumbnailPreview
      );
    }

    setThumbnailPreview("");

    setForm((previous) => ({
      ...previous,
      thumbnail: null,
    }));
  };

  /*
  ============================================================
  VALIDATE FORM
  ============================================================
  */

  const validateForm = () => {
    if (
      !form.category.trim()
    ) {
      return "Please select a category.";
    }

    if (
      !form.subcategory.trim()
    ) {
      return "Please select a subcategory.";
    }

    if (
      !form.jobTitle.trim()
    ) {
      return "Please enter a job title.";
    }

    const validTasks =
      form.tasks
        .map((task) =>
          String(task).trim()
        )
        .filter(Boolean);

    if (!validTasks.length) {
      return "Please add at least one task.";
    }

    if (
      !form.proof.trim()
    ) {
      return "Please enter the required proof.";
    }

    const workerNeed =
      Number(form.workerNeed);

    if (
      !Number.isFinite(
        workerNeed
      ) ||
      workerNeed < 1
    ) {
      return "Worker need must be at least 1.";
    }

    const workerEarn =
      Number(form.workerEarn);

    if (
      !Number.isFinite(
        workerEarn
      ) ||
      workerEarn <= 0
    ) {
      return "Worker earning must be greater than 0.";
    }

    return "";
  };

  /*
  ============================================================
  CREATE JOB REQUEST
  ============================================================
  */

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    setError("");
    setMessage("");

    const validationError =
      validateForm();

    if (validationError) {
      setError(
        validationError
      );

      return;
    }

    const token = getToken();

    if (!token) {
      setError(
        "Please login first."
      );

      navigate("/login");

      return;
    }

    setLoading(true);

    try {
      /*
      --------------------------------------------------------
      CLEAN TASKS
      --------------------------------------------------------
      */

      const cleanedTasks =
        form.tasks
          .map((task) =>
            String(task).trim()
          )
          .filter(Boolean);

      /*
      --------------------------------------------------------
      THUMBNAIL DATA

      Backend Job model stores thumbnail metadata.
      --------------------------------------------------------
      */

      let thumbnailData;

      if (form.thumbnail) {
        thumbnailData = {
          name:
            form.thumbnail.name,

          type:
            form.thumbnail.type,

          size:
            form.thumbnail.size,

          /*
          Local preview URL is useful only
          until a real upload system exists.
          */

          url:
            thumbnailPreview || "",
        };
      }

      /*
      --------------------------------------------------------
      PAYLOAD
      --------------------------------------------------------
      */

      const payload = {
        category:
          form.category.trim(),

        subcategory:
          form.subcategory.trim(),

        jobTitle:
          form.jobTitle.trim(),

        note:
          form.note.trim(),

        tasks:
          cleanedTasks,

        proof:
          form.proof.trim(),

        workerNeed:
          Number(
            form.workerNeed
          ),

        workerEarn:
          Number(
            form.workerEarn
          ),

        screenshots:
          Number(
            form.screenshots
          ) || 0,

        estimatedDay:
          Number(
            form.estimatedDay
          ) || 1,

        boostPeriod:
          form.boostPeriod,

        scheduleTime:
          form.scheduleTime || null,

        estimatedCost:
          Number(
            form.estimatedCost
          ) || 0,

        thumbnail:
          thumbnailData,

        isTopJob:
          Boolean(
            form.isTopJob
          ),
      };

      /*
      --------------------------------------------------------
      API REQUEST
      --------------------------------------------------------
      */

      const response =
        await fetch(
          `${API_BASE_URL}/jobs`,
          {
            method: "POST",

            headers:
              getAuthHeaders(),

            body:
              JSON.stringify(
                payload
              ),
          }
        );

      /*
      --------------------------------------------------------
      RESPONSE
      --------------------------------------------------------
      */

      const data =
        await response
          .json()
          .catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to create job."
        );
      }

      /*
      --------------------------------------------------------
      SUCCESS
      --------------------------------------------------------
      */

      setMessage(
        data.message ||
          "Job submitted successfully."
      );

      /*
      --------------------------------------------------------
      RESET FORM
      --------------------------------------------------------
      */

      setForm(
        initialForm
      );

      if (thumbnailPreview) {
        URL.revokeObjectURL(
          thumbnailPreview
        );
      }

      setThumbnailPreview("");

      /*
      --------------------------------------------------------
      STAY ON CREATE JOB PAGE

      User-created job is pending.
      Admin will review and approve it.
      Do not redirect to Deposit after creating the job.
      --------------------------------------------------------
      */
    } catch (submitError) {
      console.error(
        "Create job error:",
        submitError
      );

      setError(
        submitError.message ||
          "Something went wrong while creating the job."
      );
    } finally {
      setLoading(false);
    }
  };

  /*
  ============================================================
  RESET FORM
  ============================================================
  */

  const handleReset = () => {
    setError("");
    setMessage("");

    setForm(
      initialForm
    );

    if (thumbnailPreview) {
      URL.revokeObjectURL(
        thumbnailPreview
      );
    }

    setThumbnailPreview("");
  };

  /*
  ============================================================
  RENDER
  ============================================================
  */

  return (
    <div className="create-job-page">
      <div className="create-job-container">

        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="create-job-header">

          <div>
            <span className="create-job-eyebrow">
              WORK UP HOME
            </span>

            <h1>
              Create Job
            </h1>

            <p>
              Create a task for workers.
              After submission, your job
              request will be reviewed by
              admin.
            </p>
          </div>

        </div>

        {/* ==================================================
            MESSAGE
        ================================================== */}

        {message && (
          <div className="create-job-success">
            {message}
          </div>
        )}

        {error && (
          <div className="create-job-error">
            {error}
          </div>
        )}

        {/* ==================================================
            FORM
        ================================================== */}

        <form
          className="create-job-form"
          onSubmit={
            handleSubmit
          }
        >

          {/* =================================================
              BASIC INFORMATION
          ================================================= */}

          <section className="create-job-section">

            <div className="create-job-section-title">

              <span className="section-number">
                01
              </span>

              <div>
                <h2>
                  Job Information
                </h2>

                <p>
                  Give workers clear
                  information about the
                  job.
                </p>
              </div>

            </div>

            {/* ==============================================
                CATEGORY
            ============================================== */}

            <div className="create-job-grid">

              <div className="create-job-field">

                <label htmlFor="category">
                  Category
                </label>

                <select
                  id="category"
                  name="category"
                  value={
                    form.category
                  }
                  onChange={
                    handleChange
                  }
                  required
                >

                  <option value="">
                    Select category
                  </option>

                  {categoryOptions.map(
                    (category) => (
                      <option
                        key={category}
                        value={category}
                      >
                        {category}
                      </option>
                    )
                  )}

                </select>

              </div>

              {/* ============================================
                  SUBCATEGORY
              ============================================ */}

              <div className="create-job-field">

                <label htmlFor="subcategory">
                  Subcategory
                </label>

                <select
                  id="subcategory"
                  name="subcategory"
                  value={
                    form.subcategory
                  }
                  onChange={
                    handleChange
                  }
                  disabled={
                    !form.category
                  }
                  required
                >

                  <option value="">
                    Select subcategory
                  </option>

                  {subcategories.map(
                    (subcategory) => (
                      <option
                        key={subcategory}
                        value={
                          subcategory
                        }
                      >
                        {subcategory}
                      </option>
                    )
                  )}

                </select>

              </div>

            </div>

            {/* ==============================================
                JOB TITLE
            ============================================== */}

            <div className="create-job-field">

              <label htmlFor="jobTitle">
                Job Title
              </label>

              <input
                id="jobTitle"
                name="jobTitle"
                type="text"
                value={
                  form.jobTitle
                }
                onChange={
                  handleChange
                }
                placeholder="Example: Subscribe to our YouTube channel"
                maxLength={150}
                required
              />

            </div>

            {/* ==============================================
                NOTE
            ============================================== */}

            <div className="create-job-field">

              <label htmlFor="note">
                Job Note
              </label>

              <textarea
                id="note"
                name="note"
                value={
                  form.note
                }
                onChange={
                  handleChange
                }
                placeholder="Write clear instructions for workers..."
                rows={5}
                maxLength={2000}
              />

            </div>

          </section>

          {/* =================================================
              TASKS
          ================================================= */}

          <section className="create-job-section">

            <div className="create-job-section-title">

              <span className="section-number">
                02
              </span>

              <div>
                <h2>
                  Tasks
                </h2>

                <p>
                  Add the steps the worker
                  must complete.
                </p>
              </div>

            </div>

            <div className="task-list">

              {form.tasks.map(
                (
                  task,
                  index
                ) => (
                  <div
                    className="task-row"
                    key={index}
                  >

                    <span className="task-number">
                      {index + 1}
                    </span>

                    <input
                      type="text"
                      value={task}
                      onChange={(event) =>
                        handleTaskChange(
                          index,
                          event.target.value
                        )
                      }
                      placeholder={`Task ${index + 1}`}
                      maxLength={500}
                      required
                    />

                    {form.tasks.length >
                      1 && (
                      <button
                        type="button"
                        className="task-remove-btn"
                        onClick={() =>
                          removeTask(
                            index
                          )
                        }
                      >
                        ×
                      </button>
                    )}

                  </div>
                )
              )}

            </div>

            <button
              type="button"
              className="task-add-btn"
              onClick={
                addTask
              }
            >
              + Add another task
            </button>

          </section>

          {/* =================================================
              PROOF
          ================================================= */}

          <section className="create-job-section">

            <div className="create-job-section-title">

              <span className="section-number">
                03
              </span>

              <div>
                <h2>
                  Required Proof
                </h2>

                <p>
                  Tell workers what proof
                  they need to submit.
                </p>
              </div>

            </div>

            <div className="create-job-field">

              <label htmlFor="proof">
                Proof Requirement
              </label>

              <textarea
                id="proof"
                name="proof"
                value={
                  form.proof
                }
                onChange={
                  handleChange
                }
                placeholder="Example: Submit a screenshot showing that you subscribed."
                rows={4}
                maxLength={1000}
                required
              />

            </div>

          </section>

          {/* =================================================
              WORKER / PAYMENT
          ================================================= */}

          <section className="create-job-section">

            <div className="create-job-section-title">

              <span className="section-number">
                04
              </span>

              <div>
                <h2>
                  Worker & Reward
                </h2>

                <p>
                  Set the number of workers
                  and how much each worker
                  will earn.
                </p>
              </div>

            </div>

            <div className="create-job-grid">

              {/* ============================================
                  WORKER NEED
              ============================================ */}

              <div className="create-job-field">

                <label htmlFor="workerNeed">
                  Workers Needed
                </label>

                <input
                  id="workerNeed"
                  name="workerNeed"
                  type="number"
                  min="1"
                  step="1"
                  value={
                    form.workerNeed
                  }
                  onChange={
                    handleChange
                  }
                  required
                />

              </div>

              {/* ============================================
                  WORKER EARN
              ============================================ */}

              <div className="create-job-field">

                <label htmlFor="workerEarn">
                  Worker Reward (USD)
                </label>

                <div className="money-input">

                  <span>
                    $
                  </span>

                  <input
                    id="workerEarn"
                    name="workerEarn"
                    type="number"
                    min="0.001"
                    step="0.001"
                    value={
                      form.workerEarn
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="0.100"
                    required
                  />

                </div>

              </div>

            </div>

            {/* ==============================================
                ESTIMATED COST
            ============================================== */}

            <div className="create-job-cost-box">

              <div>
                <span>
                  Estimated Job Cost
                </span>

                <small>
                  Workers × worker reward
                </small>
              </div>

              <strong>
                $
                {form.estimatedCost ||
                  "0.000"}
              </strong>

            </div>

          </section>

          {/* =================================================
              JOB SETTINGS
          ================================================= */}

          <section className="create-job-section">

            <div className="create-job-section-title">

              <span className="section-number">
                05
              </span>

              <div>
                <h2>
                  Job Settings
                </h2>

                <p>
                  Configure the remaining
                  job options.
                </p>
              </div>

            </div>

            <div className="create-job-grid">

              {/* ============================================
                  SCREENSHOTS
              ============================================ */}

              <div className="create-job-field">

                <label htmlFor="screenshots">
                  Screenshots Required
                </label>

                <input
                  id="screenshots"
                  name="screenshots"
                  type="number"
                  min="0"
                  step="1"
                  value={
                    form.screenshots
                  }
                  onChange={
                    handleChange
                  }
                />

              </div>

              {/* ============================================
                  ESTIMATED DAYS
              ============================================ */}

              <div className="create-job-field">

                <label htmlFor="estimatedDay">
                  Estimated Days
                </label>

                <input
                  id="estimatedDay"
                  name="estimatedDay"
                  type="number"
                  min="1"
                  step="1"
                  value={
                    form.estimatedDay
                  }
                  onChange={
                    handleChange
                  }
                />

              </div>

              {/* ============================================
                  BOOST
              ============================================ */}

              <div className="create-job-field">

                <label htmlFor="boostPeriod">
                  Boost Period
                </label>

                <select
                  id="boostPeriod"
                  name="boostPeriod"
                  value={
                    form.boostPeriod
                  }
                  onChange={
                    handleChange
                  }
                >

                  <option value="None">
                    None
                  </option>

                  <option value="24 Hours">
                    24 Hours
                  </option>

                  <option value="3 Days">
                    3 Days
                  </option>

                  <option value="7 Days">
                    7 Days
                  </option>

                  <option value="30 Days">
                    30 Days
                  </option>

                </select>

              </div>

              {/* ============================================
                  SCHEDULE
              ============================================ */}

              <div className="create-job-field">

                <label htmlFor="scheduleTime">
                  Schedule Time
                </label>

                <input
                  id="scheduleTime"
                  name="scheduleTime"
                  type="datetime-local"
                  value={
                    form.scheduleTime
                  }
                  onChange={
                    handleChange
                  }
                />

              </div>

            </div>

            {/* ==============================================
                TOP JOB
            ============================================== */}

            <label className="create-job-checkbox">

              <input
                type="checkbox"
                name="isTopJob"
                checked={
                  form.isTopJob
                }
                onChange={
                  handleChange
                }
              />

              <span className="checkbox-custom"></span>

              <span>
                Mark as Top Job
              </span>

            </label>

          </section>

          {/* =================================================
              THUMBNAIL
          ================================================= */}

          <section className="create-job-section">

            <div className="create-job-section-title">

              <span className="section-number">
                06
              </span>

              <div>
                <h2>
                  Job Thumbnail
                </h2>

                <p>
                  Add an image to make your
                  job easier to identify.
                </p>
              </div>

            </div>

            {!thumbnailPreview ? (
              <label className="thumbnail-upload">

                <input
                  type="file"
                  accept="image/*"
                  onChange={
                    handleThumbnailChange
                  }
                />

                <div className="thumbnail-upload-icon">
                  +
                </div>

                <strong>
                  Upload Thumbnail
                </strong>

                <span>
                  PNG, JPG, WEBP up to 5MB
                </span>

              </label>
            ) : (
              <div className="thumbnail-preview-box">

                <img
                  src={
                    thumbnailPreview
                  }
                  alt="Job thumbnail preview"
                />

                <div className="thumbnail-preview-info">

                  <strong>
                    {
                      form.thumbnail
                        ?.name
                    }
                  </strong>

                  <span>
                    {(
                      Number(
                        form.thumbnail
                          ?.size || 0
                      ) /
                      1024 /
                      1024
                    ).toFixed(2)}
                    {" "}
                    MB
                  </span>

                  <button
                    type="button"
                    onClick={
                      removeThumbnail
                    }
                  >
                    Remove
                  </button>

                </div>

              </div>
            )}

          </section>

          {/* =================================================
              ADMIN REVIEW NOTICE
          ================================================= */}

          <div className="create-job-review-notice">

            <div className="review-notice-icon">
              !
            </div>

            <div>

              <strong>
                Admin Review
              </strong>

              <p>
                After you create this job,
                it will be sent to admin for
                approval. Admin can accept,
                reject, or edit the job before
                it becomes available to workers.
              </p>

            </div>

          </div>

          {/* =================================================
              ACTIONS
          ================================================= */}

          <div className="create-job-actions">

            <button
              type="button"
              className="create-job-reset-btn"
              onClick={
                handleReset
              }
              disabled={
                loading
              }
            >
              Reset
            </button>

            <button
              type="submit"
              className="create-job-submit-btn"
              disabled={
                loading
              }
            >

              {loading ? (
                <>
                  <span className="create-job-spinner"></span>

                  Creating...
                </>
              ) : (
                <>
                  Create Job
                </>
              )}

            </button>

          </div>

        </form>

      </div>
    </div>
  );
}

export default CreateJob;