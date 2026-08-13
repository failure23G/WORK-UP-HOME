import React, {
  useEffect,
  useState,
} from "react";

import {
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";

import ProtectedRoute from "./ProtectedRoute";

// ==================================================
// PUBLIC PAGES
// ==================================================

import Home from "../pages/Home/Home";
import Login from "../pages/Login/Login";
import Register from "../pages/Register/Register";

// ==================================================
// DASHBOARD PAGES
// ==================================================

import Dashboard from "../pages/Dashboard/Dashboard";
import Profile from "../pages/Dashboard/Profile";
import Settings from "../pages/Dashboard/Settings";
import MyWork from "../pages/Dashboard/MyWork";
import MyJob from "../pages/Dashboard/MyJob";
import DashboardLayout from "../pages/Dashboard/DashboardLayout";
import AdminManageBalances from "../pages/Dashboard/AdminManageBalances";

// ==================================================
// JOB PAGES
// ==================================================

import Jobs from "../pages/Jobs/Jobs";
import CreateJob from "../pages/CreateJob/CreateJob";

// ==================================================
// ADMIN JOB APPROVAL
// ==================================================

import AdminCreateJob from "../pages/AdminCreateJob/AdminCreateJob";

// ==================================================
// DEPOSIT
// ==================================================

import DepositJob from "../pages/DepositJob/DepositJob";

// ==================================================
// USER WITHDRAW
// ==================================================

import Withdraw from "../pages/Withdraw/Withdraw";

// ==================================================
// ADMIN DEPOSIT
// ==================================================

import AdminDeposits from "../pages/AdminDeposits/AdminDeposits";

// ==================================================
// ADMIN WITHDRAW
// ==================================================

import AdminWithdraw from "../pages/AdminWithdraw/AdminWithdraw";

// ==================================================
// ADMIN USERS
// ==================================================

import Users from "../pages/Users/Users";

// ==================================================
// ADMIN NOTIFICATION
// ==================================================

import AdminNotification from "../pages/AdminNotification/AdminNotification";

// ==================================================
// OTHER PAGES
// ==================================================

import Messages from "../pages/Messages/Messages";
import Projects from "../pages/Projects/Projects";

// ==================================================
// 404
// ==================================================

import NotFound from "../pages/NotFound/NotFound";

// ==================================================
// USER NOTIFICATIONS PAGE
// ==================================================

function NotificationsPage() {
  const navigate = useNavigate();

  const [notifications, setNotifications] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  // ==================================================
  // GET TOKEN
  // ==================================================

  const getToken = () => {
    return (
      localStorage.getItem("token") ||
      localStorage.getItem("accessToken")
    );
  };

  // ==================================================
  // LOAD NOTIFICATIONS
  // ==================================================

  const loadNotifications = async () => {
    try {
      setLoading(true);
      setError("");

      const token = getToken();

      if (!token) {
        setNotifications([]);
        setError(
          "You are not logged in."
        );
        return;
      }

      const response = await fetch(
        "http://localhost:5000/api/notifications",
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
        await response.json().catch(
          () => ({})
        );

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Failed to load notifications."
        );
      }

      const notificationList =
        Array.isArray(
          data?.notifications
        )
          ? data.notifications
          : Array.isArray(data)
          ? data
          : [];

      setNotifications(
        notificationList
      );
    } catch (loadError) {
      console.error(
        "Load notifications error:",
        loadError
      );

      setError(
        loadError.message ||
          "Failed to load notifications."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==================================================
  // LOAD ON PAGE OPEN
  // ==================================================

  useEffect(() => {
    loadNotifications();
  }, []);

  // ==================================================
  // UNREAD COUNT
  // ==================================================

  const unreadCount =
    notifications.filter(
      (notification) =>
        !(
          notification.read ||
          notification.isRead
        )
    ).length;

  // ==================================================
  // FORMAT DATE
  // ==================================================

  const formatDate = (date) => {
    if (!date) {
      return "";
    }

    const parsedDate =
      new Date(date);

    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {
      return "";
    }

    return parsedDate.toLocaleString();
  };

  // ==================================================
  // MARK ONE AS READ
  // ==================================================

  const markAsRead = async (
    notificationId
  ) => {
    try {
      const token = getToken();

      if (!token || !notificationId) {
        return;
      }

      const response =
        await fetch(
          `http://localhost:5000/api/notifications/${notificationId}/read`,
          {
            method: "PATCH",
            headers: {
              "Content-Type":
                "application/json",
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      if (!response.ok) {
        const data =
          await response
            .json()
            .catch(() => ({}));

        throw new Error(
          data?.message ||
            "Failed to mark notification as read."
        );
      }

      setNotifications(
        (previous) =>
          previous.map(
            (notification) => {
              const id =
                notification._id ||
                notification.id;

              if (
                String(id) ===
                String(
                  notificationId
                )
              ) {
                return {
                  ...notification,
                  read: true,
                  isRead: true,
                };
              }

              return notification;
            }
          )
      );
    } catch (readError) {
      console.error(
        "Mark notification read error:",
        readError
      );
    }
  };

  // ==================================================
  // MARK ALL AS READ
  // ==================================================

  const markAllAsRead = async () => {
    try {
      const token = getToken();

      if (!token) {
        return;
      }

      const response =
        await fetch(
          "http://localhost:5000/api/notifications/read-all",
          {
            method: "PATCH",
            headers: {
              "Content-Type":
                "application/json",
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      const data =
        await response
          .json()
          .catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Failed to mark all notifications as read."
        );
      }

      setNotifications(
        (previous) =>
          previous.map(
            (notification) => ({
              ...notification,
              read: true,
              isRead: true,
            })
          )
      );
    } catch (readAllError) {
      console.error(
        "Mark all notifications read error:",
        readAllError
      );

      setError(
        readAllError.message ||
          "Failed to mark all notifications as read."
      );
    }
  };

  // ==================================================
  // DELETE NOTIFICATION
  // ==================================================

  const deleteNotification = async (
    notificationId
  ) => {
    try {
      const token = getToken();

      if (!token || !notificationId) {
        return;
      }

      const response =
        await fetch(
          `http://localhost:5000/api/notifications/${notificationId}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type":
                "application/json",
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      const data =
        await response
          .json()
          .catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Failed to delete notification."
        );
      }

      setNotifications(
        (previous) =>
          previous.filter(
            (notification) => {
              const id =
                notification._id ||
                notification.id;

              return (
                String(id) !==
                String(
                  notificationId
                )
              );
            }
          )
      );
    } catch (deleteError) {
      console.error(
        "Delete notification error:",
        deleteError
      );

      setError(
        deleteError.message ||
          "Failed to delete notification."
      );
    }
  };

  // ==================================================
  // NOTIFICATION ICON
  // ==================================================

  const getNotificationIcon = (
    type
  ) => {
    switch (
      String(type || "").toLowerCase()
    ) {
      case "success":
        return "✅";

      case "error":
        return "❌";

      case "warning":
        return "⚠️";

      case "job":
        return "💼";

      case "info":
        return "ℹ️";

      default:
        return "🔔";
    }
  };

  // ==================================================
  // NOTIFICATION CLICK
  // ==================================================

  const handleNotificationClick =
    async (notification) => {
      const id =
        notification._id ||
        notification.id;

      await markAsRead(id);

      if (
        notification.link &&
        typeof notification.link ===
          "string"
      ) {
        const link =
          notification.link.trim();

        if (
          link &&
          link !==
            "/dashboard/notifications"
        ) {
          navigate(link);
        }
      }
    };

  // ==================================================
  // PAGE
  // ==================================================

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #f5f3ff 0%, #eef4ff 100%)",
        padding: "40px 24px",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          maxWidth: "1000px",
          margin: "0 auto",
        }}
      >
        {/* ==========================================
            HEADER
        ========================================== */}

        <div
          style={{
            display: "flex",
            justifyContent:
              "space-between",
            alignItems: "center",
            gap: "20px",
            marginBottom: "28px",
            flexWrap: "wrap",
          }}
        >
          <div>
            <div
              style={{
                fontSize: "13px",
                fontWeight: "800",
                letterSpacing:
                  "3px",
                color: "#6947ff",
                marginBottom:
                  "8px",
              }}
            >
              WORK UP HOME
            </div>

            <h1
              style={{
                margin: 0,
                fontSize:
                  "clamp(32px, 5vw, 52px)",
                fontWeight: "900",
                color: "#15213d",
              }}
            >
              Notifications
            </h1>

            <p
              style={{
                margin:
                  "10px 0 0",
                color: "#7180a3",
                fontSize: "16px",
              }}
            >
              View all your account
              notifications and job
              updates.
            </p>
          </div>

          <button
            type="button"
            onClick={
              loadNotifications
            }
            disabled={loading}
            style={{
              border: "none",
              borderRadius: "14px",
              padding:
                "13px 22px",
              background:
                "linear-gradient(135deg, #6d45ff, #4169e8)",
              color: "#ffffff",
              fontWeight: "800",
              cursor: loading
                ? "not-allowed"
                : "pointer",
              opacity: loading
                ? 0.7
                : 1,
              boxShadow:
                "0 10px 25px rgba(85, 67, 230, 0.22)",
            }}
          >
            ↻ Refresh
          </button>
        </div>

        {/* ==========================================
            ERROR
        ========================================== */}

        {error && (
          <div
            style={{
              background: "#fff0f0",
              border:
                "1px solid #ffb9b9",
              color: "#c62828",
              borderRadius: "14px",
              padding: "16px 18px",
              marginBottom:
                "20px",
              fontWeight: "700",
            }}
          >
            {error}
          </div>
        )}

        {/* ==========================================
            SUMMARY
        ========================================== */}

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "18px",
            marginBottom:
              "24px",
          }}
        >
          <div
            style={{
              background:
                "#ffffff",
              borderRadius: "20px",
              padding:
                "24px",
              boxShadow:
                "0 10px 35px rgba(49, 53, 100, 0.08)",
              border:
                "1px solid #eeeaff",
            }}
          >
            <div
              style={{
                fontSize: "14px",
                color: "#7884a5",
                fontWeight: "700",
                marginBottom:
                  "8px",
              }}
            >
              Total Notifications
            </div>

            <div
              style={{
                fontSize: "34px",
                fontWeight: "900",
                color: "#1b2a4a",
              }}
            >
              {notifications.length}
            </div>
          </div>

          <div
            style={{
              background:
                "#ffffff",
              borderRadius: "20px",
              padding:
                "24px",
              boxShadow:
                "0 10px 35px rgba(49, 53, 100, 0.08)",
              border:
                "1px solid #eeeaff",
            }}
          >
            <div
              style={{
                fontSize: "14px",
                color: "#7884a5",
                fontWeight: "700",
                marginBottom:
                  "8px",
              }}
            >
              Unread
            </div>

            <div
              style={{
                fontSize: "34px",
                fontWeight: "900",
                color:
                  unreadCount > 0
                    ? "#6947ff"
                    : "#1b2a4a",
              }}
            >
              {unreadCount}
            </div>
          </div>
        </div>

        {/* ==========================================
            ACTION BAR
        ========================================== */}

        <div
          style={{
            background:
              "#ffffff",
            borderRadius: "18px",
            padding:
              "18px 20px",
            marginBottom:
              "18px",
            display: "flex",
            justifyContent:
              "space-between",
            alignItems: "center",
            gap: "15px",
            flexWrap: "wrap",
            boxShadow:
              "0 10px 35px rgba(49, 53, 100, 0.08)",
          }}
        >
          <div
            style={{
              color: "#253557",
              fontWeight: "800",
            }}
          >
            {unreadCount > 0
              ? `${unreadCount} unread notification${
                  unreadCount ===
                  1
                    ? ""
                    : "s"
                }`
              : "No unread notifications"}
          </div>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={
                markAllAsRead
              }
              style={{
                border: "none",
                background:
                  "#eef1ff",
                color: "#5d48e8",
                borderRadius:
                  "10px",
                padding:
                  "10px 16px",
                fontWeight: "800",
                cursor:
                  "pointer",
              }}
            >
              ✓ Mark all as read
            </button>
          )}
        </div>

        {/* ==========================================
            NOTIFICATION LIST
        ========================================== */}

        <div
          style={{
            background:
              "#ffffff",
            borderRadius: "22px",
            overflow: "hidden",
            boxShadow:
              "0 10px 40px rgba(49, 53, 100, 0.09)",
          }}
        >
          {loading ? (
            <div
              style={{
                padding: "70px 20px",
                textAlign: "center",
                color: "#7380a1",
                fontWeight: "700",
              }}
            >
              Loading notifications...
            </div>
          ) : notifications.length ===
            0 ? (
            <div
              style={{
                padding: "80px 20px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  width: "70px",
                  height: "70px",
                  borderRadius:
                    "20px",
                  background:
                    "#f0efff",
                  display: "flex",
                  alignItems:
                    "center",
                  justifyContent:
                    "center",
                  margin:
                    "0 auto 18px",
                  fontSize: "30px",
                }}
              >
                🔔
              </div>

              <h2
                style={{
                  margin:
                    "0 0 8px",
                  color:
                    "#1b2a4a",
                  fontSize:
                    "24px",
                  fontWeight:
                    "900",
                }}
              >
                No Notifications
              </h2>

              <p
                style={{
                  margin: 0,
                  color:
                    "#7c88a8",
                }}
              >
                You don't have
                any notifications
                yet.
              </p>
            </div>
          ) : (
            notifications.map(
              (notification) => {
                const id =
                  notification._id ||
                  notification.id;

                const isRead =
                  notification.read ||
                  notification.isRead;

                return (
                  <div
                    key={id}
                    style={{
                      display: "flex",
                      alignItems:
                        "flex-start",
                      gap: "16px",
                      padding:
                        "22px",
                      borderBottom:
                        "1px solid #edf0f7",
                      background:
                        isRead
                          ? "#ffffff"
                          : "#f7f7ff",
                      cursor:
                        "pointer",
                    }}
                    onClick={() =>
                      handleNotificationClick(
                        notification
                      )
                    }
                  >
                    {/* ICON */}

                    <div
                      style={{
                        width: "50px",
                        height: "50px",
                        minWidth: "50px",
                        borderRadius:
                          "15px",
                        background:
                          isRead
                            ? "#f0f2fa"
                            : "#eceaff",
                        display: "flex",
                        alignItems:
                          "center",
                        justifyContent:
                          "center",
                        fontSize:
                          "22px",
                      }}
                    >
                      {getNotificationIcon(
                        notification.type
                      )}
                    </div>

                    {/* CONTENT */}

                    <div
                      style={{
                        flex: 1,
                        minWidth: 0,
                      }}
                    >
                      <div
                        style={{
                          display:
                            "flex",
                          justifyContent:
                            "space-between",
                          alignItems:
                            "flex-start",
                          gap: "10px",
                        }}
                      >
                        <h3
                          style={{
                            margin: 0,
                            color:
                              "#1d2b4d",
                            fontSize:
                              "17px",
                            fontWeight:
                              "900",
                          }}
                        >
                          {notification.title ||
                            "Notification"}
                        </h3>

                        {!isRead && (
                          <span
                            style={{
                              width:
                                "9px",
                              height:
                                "9px",
                              minWidth:
                                "9px",
                              borderRadius:
                                "50%",
                              background:
                                "#4169e8",
                              marginTop:
                                "6px",
                            }}
                          />
                        )}
                      </div>

                      <p
                        style={{
                          margin:
                            "7px 0",
                          color:
                            "#7180a2",
                          fontSize:
                            "14px",
                          lineHeight:
                            "1.6",
                        }}
                      >
                        {notification.message ||
                          ""}
                      </p>

                      <small
                        style={{
                          color:
                            "#9aa4bd",
                          fontSize:
                            "12px",
                        }}
                      >
                        {formatDate(
                          notification.createdAt ||
                            notification.created_at
                        )}
                      </small>
                    </div>

                    {/* DELETE */}

                    <button
                      type="button"
                      title="Delete notification"
                      onClick={(
                        event
                      ) => {
                        event.stopPropagation();

                        deleteNotification(
                          id
                        );
                      }}
                      style={{
                        border:
                          "none",
                        background:
                          "#fff0f0",
                        color:
                          "#e24a4a",
                        width:
                          "36px",
                        height:
                          "36px",
                        borderRadius:
                          "10px",
                        cursor:
                          "pointer",
                        fontWeight:
                          "900",
                        fontSize:
                          "16px",
                        flexShrink: 0,
                      }}
                    >
                      ×
                    </button>
                  </div>
                );
              }
            )
          )}
        </div>

        {/* ==========================================
            BACK BUTTON
        ========================================== */}

        <div
          style={{
            marginTop: "22px",
          }}
        >
          <button
            type="button"
            onClick={() =>
              navigate(
                "/dashboard"
              )
            }
            style={{
              border: "none",
              background:
                "#ffffff",
              color:
                "#4f46c7",
              borderRadius:
                "12px",
              padding:
                "12px 20px",
              fontWeight:
                "800",
              cursor:
                "pointer",
              boxShadow:
                "0 8px 25px rgba(49, 53, 100, 0.08)",
            }}
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

// ==================================================
// APP ROUTES
// ==================================================

function AppRoutes() {
  return (
    <Routes>

      {/* ==================================================
          PUBLIC ROUTES
      ================================================== */}

      <Route
        path="/"
        element={
          <Home />
        }
      />

      <Route
        path="/login"
        element={
          <Login />
        }
      />

      <Route
        path="/register"
        element={
          <Register />
        }
      />

      {/* ==================================================
          PROTECTED ROUTES
      ================================================== */}

      <Route
        element={
          <ProtectedRoute />
        }
      >

        {/* ==================================================
            MAIN DASHBOARD
        ================================================== */}

        <Route
          path="/dashboard"
          element={
            <Dashboard />
          }
        />

        {/* ==================================================
            AVAILABLE JOBS
        ================================================== */}

        <Route
          path="/dashboard/jobs"
          element={
            <Jobs />
          }
        />

        {/* ==================================================
            CREATE JOB - USER
        ================================================== */}

        <Route
          path="/dashboard/create-job"
          element={
            <CreateJob />
          }
        />

        {/* ==================================================
            MY JOB - USER

            User creates a job
                  ↓
            Job appears here
                  ↓
            Worker submits work
                  ↓
            User views worker work
                  ↓
            Approve / Reject
        ================================================== */}

        <Route
          path="/dashboard/my-job"
          element={
            <MyJob />
          }
        />

        {/* ==================================================
            USER NOTIFICATIONS

            Navbar:
            View all notifications
                  ↓
            /dashboard/notifications
                  ↓
            NotificationsPage
        ================================================== */}

        <Route
          path="/dashboard/notifications"
          element={
            <NotificationsPage />
          }
        />

        {/* ==================================================
            JOB APPROVAL - ADMIN
        ================================================== */}

        <Route
          path="/dashboard/admin/create-job"
          element={
            <AdminCreateJob />
          }
        />

        {/* ==================================================
            ADMIN JOB APPROVAL SHORT ROUTE
        ================================================== */}

        <Route
          path="/admin/create-job"
          element={
            <AdminCreateJob />
          }
        />

        {/* ==================================================
            MY WORK
        ================================================== */}

        <Route
          path="/dashboard/my-work"
          element={
            <MyWork />
          }
        />

        {/* ==================================================
            PROFILE
        ================================================== */}

        <Route
          path="/dashboard/profile"
          element={
            <Profile />
          }
        />

        {/* ==================================================
            SETTINGS
        ================================================== */}

        <Route
          path="/dashboard/settings"
          element={
            <Settings />
          }
        />

        {/* ==================================================
            USER DEPOSIT
        ================================================== */}

        <Route
          path="/dashboard/depositjob"
          element={
            <DepositJob />
          }
        />

        {/* ==================================================
            USER WITHDRAW
        ================================================== */}

        <Route
          path="/dashboard/withdraw"
          element={
            <Withdraw />
          }
        />

        {/* ==================================================
            ADMIN DEPOSIT DASHBOARD
        ================================================== */}

        <Route
          path="/dashboard/admin/deposits"
          element={
            <AdminDeposits />
          }
        />

        {/* ==================================================
            ADMIN WITHDRAW
        ================================================== */}

        <Route
          path="/dashboard/admin/withdraw"
          element={
            <AdminWithdraw />
          }
        />

        {/* ==================================================
            ADMIN MANAGE BALANCES
        ================================================== */}

        <Route
          path="/dashboard/admin/manage-balances"
          element={
            <AdminManageBalances />
          }
        />

        {/* ==================================================
            ADMIN USERS
        ================================================== */}

        <Route
          path="/dashboard/admin/users"
          element={
            <Users />
          }
        />

        {/* ==================================================
            ADMIN NOTIFICATION
        ================================================== */}

        <Route
          path="/dashboard/admin/notifications"
          element={
            <AdminNotification />
          }
        />

        {/* ==================================================
            ADMIN USERS SHORT ROUTE
        ================================================== */}

        <Route
          path="/admin/users"
          element={
            <Users />
          }
        />

        {/* ==================================================
            ADMIN DEPOSIT SHORT ROUTE
        ================================================== */}

        <Route
          path="/admin/deposits"
          element={
            <AdminDeposits />
          }
        />

        {/* ==================================================
            ADMIN WITHDRAW SHORT ROUTE
        ================================================== */}

        <Route
          path="/admin/withdraw"
          element={
            <AdminWithdraw />
          }
        />

        {/* ==================================================
            ADMIN NOTIFICATION SHORT ROUTE
        ================================================== */}

        <Route
          path="/admin/notifications"
          element={
            <AdminNotification />
          }
        />

        {/* ==================================================
            MESSAGES
        ================================================== */}

        <Route
          path="/dashboard/messages"
          element={
            <Messages />
          }
        />

        {/* ==================================================
            PROJECTS
        ================================================== */}

        <Route
          path="/dashboard/projects"
          element={
            <Projects />
          }
        />

        {/* ==================================================
            OLD ROUTES
        ================================================== */}

        <Route
          path="/jobs"
          element={
            <Jobs />
          }
        />

        <Route
          path="/create-job"
          element={
            <CreateJob />
          }
        />

        <Route
          path="/depositjob"
          element={
            <DepositJob />
          }
        />

        <Route
          path="/messages"
          element={
            <Messages />
          }
        />

        <Route
          path="/projects"
          element={
            <Projects />
          }
        />

      </Route>

      {/* ==================================================
          404 PAGE
      ================================================== */}

      <Route
        path="/404"
        element={
          <NotFound />
        }
      />

      {/* ==================================================
          UNKNOWN ROUTE
      ================================================== */}

      <Route
        path="*"
        element={
          <Navigate
            to="/404"
            replace
          />
        }
      />

    </Routes>
  );
}

// ==================================================
// EXPORT
// ==================================================

export default AppRoutes;