import React, {
  useEffect,
  useState,
} from "react";

import "./AdminNotification.css";


// ============================================================
// API
// ============================================================

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";


// ============================================================
// TOKEN
// ============================================================

const getToken = () => {
  return (
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("authToken") ||
    ""
  );
};


// ============================================================
// ADMIN NOTIFICATION
// ============================================================

function AdminNotification() {

  const [
    title,
    setTitle,
  ] = useState("");

  const [
    message,
    setMessage,
  ] = useState("");

  const [
    target,
    setTarget,
  ] = useState("all");

  const [
    userId,
    setUserId,
  ] = useState("");

  const [
    type,
    setType,
  ] = useState("general");

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    users,
    setUsers,
  ] = useState([]);

  const [
    usersLoading,
    setUsersLoading,
  ] = useState(false);

  const [
    successMessage,
    setSuccessMessage,
  ] = useState("");

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const [
    sentCount,
    setSentCount,
  ] = useState(0);


  // ==========================================================
  // LOAD USERS
  // ==========================================================

  const loadUsers = async () => {

    try {

      setUsersLoading(true);

      const token =
        getToken();

      const response =
        await fetch(
          `${API_URL}/admin/users`,
          {
            method: "GET",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${token}`,
            },
          }
        );


      const data =
        await response.json();


      if (!response.ok) {

        throw new Error(
          data?.message ||
          "Failed to load users"
        );

      }


      setUsers(
        Array.isArray(
          data?.users
        )
          ? data.users
          : []
      );

    } catch (error) {

      console.error(
        "Load admin users error:",
        error
      );

      setErrorMessage(
        error.message ||
        "Failed to load users"
      );

    } finally {

      setUsersLoading(false);

    }

  };


  // ==========================================================
  // LOAD USERS ON PAGE OPEN
  // ==========================================================

  useEffect(() => {

    loadUsers();

  }, []);


  // ==========================================================
  // SEND NOTIFICATION
  // ==========================================================

  const handleSubmit =
    async (event) => {

      event.preventDefault();


      setSuccessMessage("");
      setErrorMessage("");


      // --------------------------------------------------------
      // VALIDATION
      // --------------------------------------------------------

      if (
        !title.trim()
      ) {

        setErrorMessage(
          "Please enter notification title."
        );

        return;
      }


      if (
        !message.trim()
      ) {

        setErrorMessage(
          "Please enter notification message."
        );

        return;
      }


      if (
        target === "user" &&
        !userId
      ) {

        setErrorMessage(
          "Please select a user."
        );

        return;
      }


      try {

        setLoading(true);


        const token =
          getToken();


        const body = {
          target,

          title:
            title.trim(),

          message:
            message.trim(),

          type,

        };


        if (
          target === "user"
        ) {

          body.userId =
            userId;

        }


        const response =
          await fetch(
            `${API_URL}/notifications/admin/send`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${token}`,
              },

              body:
                JSON.stringify(
                  body
                ),
            }
          );


        const data =
          await response.json();


        if (!response.ok) {

          throw new Error(
            data?.message ||
            "Failed to send notification"
          );

        }


        // ------------------------------------------------------
        // SUCCESS
        // ------------------------------------------------------

        const count =
          Number(
            data?.count || 0
          );


        setSentCount(
          count
        );


        setSuccessMessage(
          target === "all"
            ? `Notification sent successfully to ${count} users.`
            : "Notification sent successfully."
        );


        // ------------------------------------------------------
        // RESET
        // ------------------------------------------------------

        setTitle("");

        setMessage("");

        setUserId("");

        setType(
          "general"
        );

        setTarget(
          "all"
        );


      } catch (error) {

        console.error(
          "Send admin notification error:",
          error
        );

        setErrorMessage(
          error.message ||
          "Failed to send notification"
        );

      } finally {

        setLoading(false);

      }

    };


  // ==========================================================
  // SELECT USER
  // ==========================================================

  const handleUserChange =
    (event) => {

      setUserId(
        event.target.value
      );

      setErrorMessage("");

      setSuccessMessage("");

    };


  // ==========================================================
  // TARGET CHANGE
  // ==========================================================

  const handleTargetChange =
    (value) => {

      setTarget(value);

      setErrorMessage("");

      setSuccessMessage("");

      if (
        value === "all"
      ) {

        setUserId("");

      }

    };


  // ==========================================================
  // RENDER
  // ==========================================================

  return (

    <div className="admin-notification-page">


      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="admin-notification-header">

        <div>

          <p className="admin-notification-kicker">
            ADMIN PANEL
          </p>

          <h1>
            Admin Notification
          </h1>

          <p className="admin-notification-subtitle">
            Send notifications to all users
            or a specific user.
          </p>

        </div>


        <div className="admin-notification-header-icon">
          🔔
        </div>

      </div>


      {/* ======================================================
          SUCCESS
      ====================================================== */}

      {successMessage && (

        <div className="admin-notification-success">

          <span>
            ✓
          </span>

          <div>

            <strong>
              Success
            </strong>

            <p>
              {successMessage}
            </p>

          </div>

        </div>

      )}


      {/* ======================================================
          ERROR
      ====================================================== */}

      {errorMessage && (

        <div className="admin-notification-error">

          <span>
            !
          </span>

          <div>

            <strong>
              Error
            </strong>

            <p>
              {errorMessage}
            </p>

          </div>

        </div>

      )}


      {/* ======================================================
          MAIN FORM CARD
      ====================================================== */}

      <div className="admin-notification-card">


        <div className="admin-notification-card-header">

          <div className="admin-notification-card-icon">
            📢
          </div>

          <div>

            <h2>
              Create Notification
            </h2>

            <p>
              Write your message and choose
              who should receive it.
            </p>

          </div>

        </div>


        <form
          onSubmit={
            handleSubmit
          }
          className="admin-notification-form"
        >


          {/* ==================================================
              TITLE
          ================================================== */}

          <div className="admin-notification-field">

            <label htmlFor="notification-title">
              Notification Title
            </label>

            <input
              id="notification-title"
              type="text"
              value={title}
              onChange={(event) =>
                setTitle(
                  event.target.value
                )
              }
              placeholder="Enter notification title"
              maxLength={120}
              disabled={
                loading
              }
            />

            <small>
              {title.length}/120
            </small>

          </div>


          {/* ==================================================
              MESSAGE
          ================================================== */}

          <div className="admin-notification-field">

            <label htmlFor="notification-message">
              Message
            </label>

            <textarea
              id="notification-message"
              value={message}
              onChange={(event) =>
                setMessage(
                  event.target.value
                )
              }
              placeholder="Write your notification message..."
              rows={7}
              maxLength={1000}
              disabled={
                loading
              }
            />

            <small>
              {message.length}/1000
            </small>

          </div>


          {/* ==================================================
              SEND TO
          ================================================== */}

          <div className="admin-notification-field">

            <label>
              Send To
            </label>


            <div className="admin-target-options">


              {/* ALL USERS */}

              <button
                type="button"
                className={
                  `admin-target-option ${
                    target === "all"
                      ? "selected"
                      : ""
                  }`
                }
                onClick={() =>
                  handleTargetChange(
                    "all"
                  )
                }
                disabled={
                  loading
                }
              >

                <span className="admin-target-radio">

                  {target === "all"
                    ? "●"
                    : "○"}

                </span>

                <span>

                  <strong>
                    All Users
                  </strong>

                  <small>
                    Send to every normal user
                  </small>

                </span>

              </button>


              {/* SPECIFIC USER */}

              <button
                type="button"
                className={
                  `admin-target-option ${
                    target === "user"
                      ? "selected"
                      : ""
                  }`
                }
                onClick={() =>
                  handleTargetChange(
                    "user"
                  )
                }
                disabled={
                  loading
                }
              >

                <span className="admin-target-radio">

                  {target === "user"
                    ? "●"
                    : "○"}

                </span>

                <span>

                  <strong>
                    Specific User
                  </strong>

                  <small>
                    Send to one selected user
                  </small>

                </span>

              </button>

            </div>

          </div>


          {/* ==================================================
              USER SELECT
          ================================================== */}

          {target === "user" && (

            <div className="admin-notification-field">

              <label htmlFor="notification-user">
                Select User
              </label>

              <select
                id="notification-user"
                value={userId}
                onChange={
                  handleUserChange
                }
                disabled={
                  loading ||
                  usersLoading
                }
              >

                <option value="">
                  {usersLoading
                    ? "Loading users..."
                    : "Select a user"}
                </option>


                {users.map(
                  (user) => (

                    <option
                      key={
                        user._id
                      }
                      value={
                        user._id
                      }
                    >

                      {user.userId ||
                        user._id}

                      {" — "}

                      {user.fullName ||
                        user.name ||
                        "Unnamed User"}

                      {" — "}

                      {user.email ||
                        "No email"}

                    </option>

                  )
                )}

              </select>

            </div>

          )}


          {/* ==================================================
              TYPE
          ================================================== */}

          <div className="admin-notification-field">

            <label htmlFor="notification-type">
              Notification Type
            </label>

            <select
              id="notification-type"
              value={type}
              onChange={(event) =>
                setType(
                  event.target.value
                )
              }
              disabled={
                loading
              }
            >

              <option value="general">
                General
              </option>

              <option value="success">
                Success
              </option>

              <option value="info">
                Information
              </option>

              <option value="warning">
                Warning
              </option>

              <option value="error">
                Important / Error
              </option>

            </select>

          </div>


          {/* ==================================================
              PREVIEW
          ================================================== */}

          <div className="admin-notification-preview">

            <div className="admin-preview-header">

              <span>
                Preview
              </span>

              <span>
                🔔
              </span>

            </div>


            <div className="admin-preview-body">

              <h3>
                {title ||
                  "Notification Title"}
              </h3>

              <p>
                {message ||
                  "Your notification message will appear here."}
              </p>

            </div>

          </div>


          {/* ==================================================
              SEND BUTTON
          ================================================== */}

          <button
            type="submit"
            className="admin-notification-send-btn"
            disabled={
              loading
            }
          >

            {loading ? (

              <>
                <span className="admin-send-spinner"></span>

                Sending...
              </>

            ) : (

              <>
                📢 Send Notification
              </>

            )}

          </button>


        </form>

      </div>


      {/* ======================================================
          INFO
      ====================================================== */}

      <div className="admin-notification-info">

        <div className="admin-info-icon">
          💡
        </div>

        <div>

          <strong>
            Notification Tips
          </strong>

          <p>
            All Users sends the notification
            to every normal user. Specific User
            sends it only to the selected user.
          </p>

        </div>

      </div>


    </div>

  );
}


export default AdminNotification;