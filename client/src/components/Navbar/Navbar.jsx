import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  getMe,
} from "../../services/authService";

import "./Navbar.css";

const Navbar = () => {
  const navigate = useNavigate();

  // =========================================
  // USER DATA
  // =========================================

  const [userName, setUserName] =
    useState("User");

  const [userEmail, setUserEmail] =
    useState("");

  const [userId, setUserId] =
    useState("000000");

  const [earning, setEarning] =
    useState("0.000");

  const [deposit, setDeposit] =
    useState("0.000");

  // =========================================
  // NOTIFICATION
  // =========================================

  const [notifications, setNotifications] =
    useState([]);

  const [notificationOpen, setNotificationOpen] =
    useState(false);

  // =========================================
  // PROFILE MENU
  // =========================================

  const [profileOpen, setProfileOpen] =
    useState(false);

  const notificationRef =
    useRef(null);

  const profileRef =
    useRef(null);

  // =========================================
  // LOAD USER DATA
  // =========================================

  useEffect(() => {
    let mounted = true;

    const applyUser = (user) => {
      if (!user || !mounted) {
        return;
      }

      setUserName(
        user.name ||
          user.fullName ||
          user.username ||
          "User"
      );

      setUserEmail(
        user.email || ""
      );

      setUserId(
        String(
          user.userId ||
            user.id ||
            user._id ||
            "000000"
        )
      );

      const currentEarning =
        Number(user.earning || 0);

      const currentDeposit =
        Number(user.deposit || 0);

      setEarning(
        currentEarning.toFixed(3)
      );

      setDeposit(
        currentDeposit.toFixed(3)
      );

      // Keep localStorage synchronized with the latest
      // database values so other components can use them too.
      try {
        localStorage.setItem(
          "user",
          JSON.stringify(user)
        );

        localStorage.setItem(
          "currentUser",
          JSON.stringify(user)
        );

        localStorage.setItem(
          "earning",
          currentEarning.toFixed(3)
        );

        localStorage.setItem(
          "deposit",
          currentDeposit.toFixed(3)
        );
      } catch (storageError) {
        console.log(
          "User localStorage update error:",
          storageError
        );
      }
    };

    const loadUser = async () => {
      // First show cached data immediately.
      const storedUser =
        localStorage.getItem("user") ||
        localStorage.getItem("currentUser");

      if (storedUser) {
        try {
          applyUser(
            JSON.parse(storedUser)
          );
        } catch (error) {
          console.log(
            "User data parse error:",
            error
          );
        }
      } else {
        // Fallback local storage values.
        setUserName(
          localStorage.getItem("userName") ||
            "User"
        );

        setUserEmail(
          localStorage.getItem("userEmail") ||
            ""
        );

        setUserId(
          localStorage.getItem("userId") ||
            "000000"
        );

        setEarning(
          Number(
            localStorage.getItem("earning") || 0
          ).toFixed(3)
        );

        setDeposit(
          Number(
            localStorage.getItem("deposit") || 0
          ).toFixed(3)
        );
      }

      // Then get the latest values directly from the backend.
      try {
        const data = await getMe();

        const currentUser =
          data?.user ||
          data?.data ||
          data;

        if (currentUser) {
          applyUser(currentUser);
        }
      } catch (error) {
        console.log(
          "Latest user data load error:",
          error
        );
      }
    };

    loadUser();

    // Update immediately when another part of the app tells us
    // that the user has changed.
    window.addEventListener(
      "userUpdated",
      loadUser
    );

    // Refresh from the database periodically so an admin balance
    // change appears in the user's navbar without requiring logout.
    const interval = setInterval(
      loadUser,
      5000
    );

    // Refresh when the user returns to this browser tab.
    window.addEventListener(
      "focus",
      loadUser
    );

    return () => {
      mounted = false;

      window.removeEventListener(
        "userUpdated",
        loadUser
      );

      window.removeEventListener(
        "focus",
        loadUser
      );

      clearInterval(interval);
    };
  }, []);


  // =========================================
  // LOAD NOTIFICATIONS
  // =========================================

  const loadNotifications =
    async () => {
      try {
        const token =
          localStorage.getItem(
            "token"
          ) ||
          localStorage.getItem(
            "accessToken"
          );

        if (!token) {
          setNotifications([]);
          return;
        }

        const response =
          await fetch(
            "https://work-up-home.onrender.com/api/notifications",
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

        if (!response.ok) {
          throw new Error(
            "Notification request failed"
          );
        }

        const data =
          await response.json();

        if (Array.isArray(data)) {
          setNotifications(data);
        } else if (
          Array.isArray(
            data.notifications
          )
        ) {
          setNotifications(
            data.notifications
          );
        } else {
          setNotifications([]);
        }
      } catch (error) {
        console.log(
          "Notification load error:",
          error.message
        );

        // =====================================
        // LOCAL FALLBACK
        // =====================================

        try {
          const localNotifications =
            JSON.parse(
              localStorage.getItem(
                "notifications"
              ) || "[]"
            );

          setNotifications(
            Array.isArray(
              localNotifications
            )
              ? localNotifications
              : []
          );
        } catch {
          setNotifications([]);
        }
      }
    };

  // =========================================
  // NOTIFICATION AUTO REFRESH
  // =========================================

  useEffect(() => {
    loadNotifications();

    const interval =
      setInterval(() => {
        loadNotifications();
      }, 15000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  // =========================================
  // CLOSE DROPDOWN OUTSIDE CLICK
  // =========================================

  useEffect(() => {
    const handleOutsideClick =
      (event) => {
        if (
          notificationRef.current &&
          !notificationRef.current.contains(
            event.target
          )
        ) {
          setNotificationOpen(false);
        }

        if (
          profileRef.current &&
          !profileRef.current.contains(
            event.target
          )
        ) {
          setProfileOpen(false);
        }
      };

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, []);

  // =========================================
  // UNREAD COUNT
  // =========================================

  const unreadCount =
    notifications.filter(
      (item) =>
        !(
          item.read ||
          item.isRead
        )
    ).length;

  // =========================================
  // BELL CLICK
  // =========================================

  const handleNotificationClick =
    () => {
      setNotificationOpen(
        (previous) =>
          !previous
      );

      setProfileOpen(false);

      loadNotifications();
    };

  // =========================================
  // MARK ONE NOTIFICATION AS READ
  // =========================================

  const markAsRead =
    async (notificationId) => {
      try {
        const token =
          localStorage.getItem(
            "token"
          ) ||
          localStorage.getItem(
            "accessToken"
          );

        if (
          token &&
          notificationId
        ) {
          await fetch(
            `https://work-up-home.onrender.com/api/notifications/${notificationId}/read`,
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
        }
      } catch (error) {
        console.log(
          "Mark notification read error:",
          error
        );
      }

      setNotifications(
        (previous) =>
          previous.map(
            (item) => {
              const id =
                item._id ||
                item.id;

              return String(id) ===
                String(
                  notificationId
                )
                ? {
                    ...item,
                    read: true,
                    isRead: true,
                  }
                : item;
            }
          )
      );
    };

  // =========================================
  // MARK ALL AS READ
  // =========================================

  const markAllAsRead =
    async () => {
      try {
        const token =
          localStorage.getItem(
            "token"
          ) ||
          localStorage.getItem(
            "accessToken"
          );

        if (token) {
          await fetch(
            "https://work-up-home.onrender.com/api/notifications/read-all",
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
        }
      } catch (error) {
        console.log(
          "Mark all read error:",
          error
        );
      }

      setNotifications(
        (previous) =>
          previous.map(
            (item) => ({
              ...item,
              read: true,
              isRead: true,
            })
          )
      );
    };

  // =========================================
  // LOGOUT
  // =========================================

  const handleLogout =
    () => {
      localStorage.removeItem(
        "token"
      );

      localStorage.removeItem(
        "accessToken"
      );

      localStorage.removeItem(
        "user"
      );

      localStorage.removeItem(
        "currentUser"
      );

      localStorage.removeItem(
        "userName"
      );

      localStorage.removeItem(
        "userEmail"
      );

      localStorage.removeItem(
        "userId"
      );

      localStorage.removeItem(
        "earning"
      );

      localStorage.removeItem(
        "deposit"
      );

      localStorage.removeItem(
        "notifications"
      );

      navigate("/login");
    };

  // =========================================
  // PROFILE MENU
  // =========================================

  const handleProfileClick =
    () => {
      setProfileOpen(
        (previous) =>
          !previous
      );

      setNotificationOpen(false);
    };

  // =========================================
  // NOTIFICATION DATE
  // =========================================

  const formatNotificationDate =
    (date) => {
      if (!date) {
        return "";
      }

      const notificationDate =
        new Date(date);

      if (
        Number.isNaN(
          notificationDate.getTime()
        )
      ) {
        return "";
      }

      return notificationDate.toLocaleString();
    };

  // =========================================
  // USER INITIAL
  // =========================================

  const initial =
    userName
      ?.charAt(0)
      ?.toUpperCase() ||
    "U";

  // =========================================
  // RENDER
  // =========================================

  return (
    <header className="navbar">
    <button
  type="button"
  className="mobile-menu-button"
  aria-label="Open menu"
  onClick={() => {
    window.dispatchEvent(
      new Event("toggleSidebar")
    );
  }}
>
  <span></span>
  <span></span>
  <span></span>
</button>

      {/* =====================================
          BRAND
      ====================================== */}

      <div
        className="navbar-brand"
        onClick={() =>
          navigate(
            "/dashboard"
          )
        }
      >
        <div className="brand-icon">
          <span className="brand-h">H</span>
        </div>

        <div className="brand-name">
          WORK UP HOME
        </div>
      </div>

      {/* =====================================
          RIGHT SIDE
      ====================================== */}

      <div className="navbar-right">

        {/* =================================
            EARNING
        ================================== */}

        <div className="balance-box earning-box">
          <span>
            Earning:
          </span>

          <strong>
            {earning}
          </strong>
        </div>

        {/* =================================
            DEPOSIT
        ================================== */}

        <div className="balance-box deposit-box">
          <span>
            Deposit:
          </span>

          <strong>
            {deposit}
          </strong>
        </div>

        {/* =================================
            NOTIFICATION
        ================================== */}

        <div
          className="notification-wrapper"
          ref={
            notificationRef
          }
        >
          <button
            type="button"
            className="notification-button"
            onClick={
              handleNotificationClick
            }
          >
            🔔

            {unreadCount >
              0 && (
              <span className="notification-count">
                {unreadCount >
                99
                  ? "99+"
                  : unreadCount}
              </span>
            )}
          </button>

          {notificationOpen && (
            <div className="notification-dropdown">

              <div className="notification-header">

                <div>
                  <h3>
                    Notifications
                  </h3>

                  <span>
                    {unreadCount >
                    0
                      ? `${unreadCount} unread`
                      : "No unread notifications"}
                  </span>
                </div>

                {unreadCount >
                  0 && (
                  <button
                    type="button"
                    className="mark-read-button"
                    onClick={
                      markAllAsRead
                    }
                  >
                    Mark all as read
                  </button>
                )}
              </div>

              <div className="notification-list">

                {notifications.length ===
                0 ? (
                  <div className="no-notification">

                    <div className="no-notification-icon">
                      🔔
                    </div>

                    <p>
                      No new notifications
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
                          className={
                            `notification-item ${
                              isRead
                                ? "notification-read"
                                : "notification-unread"
                            }`
                          }
                          onClick={() =>
                            markAsRead(
                              id
                            )
                          }
                        >

                          <div className="notification-icon">
                            {notification.type ===
                            "success"
                              ? "✅"
                              : notification.type ===
                                "warning"
                              ? "⚠️"
                              : notification.type ===
                                "job"
                              ? "💼"
                              : "🔔"}
                          </div>

                          <div className="notification-content">

                            <h4>
                              {
                                notification.title ||
                                "Notification"
                              }
                            </h4>

                            <p>
                              {
                                notification.message ||
                                ""
                              }
                            </p>

                            <small>
                              {formatNotificationDate(
                                notification.createdAt ||
                                  notification.created_at
                              )}
                            </small>

                          </div>

                          {!isRead && (
                            <span className="unread-dot" />
                          )}

                        </div>
                      );
                    }
                  )
                )}

              </div>

              <div className="notification-footer">

                <button
                  type="button"
                  onClick={() => {
                    setNotificationOpen(
                      false
                    );

                    navigate(
                      "/dashboard/notifications"
                    );
                  }}
                >
                  View all notifications
                </button>

              </div>

            </div>
          )}
        </div>

        {/* =================================
            USER PROFILE
        ================================== */}

        <div
          className="navbar-profile"
          ref={profileRef}
        >

          <button
            type="button"
            className="profile-button"
            onClick={
              handleProfileClick
            }
          >

            {/* AVATAR */}

            <div className="profile-avatar">
              {initial}
            </div>

            {/* USER INFORMATION */}

            <div className="profile-info">

              <strong>
                {userName}
              </strong>

              {/* USER ID */}
              <span className="profile-user-id">
                ID: {userId}
              </span>

              {/* EMAIL */}
              <span>
                {userEmail}
              </span>

            </div>

            {/* THREE DOTS */}

            <span className="three-dots">
              ⋮
            </span>

          </button>

          {/* PROFILE DROPDOWN */}

          {profileOpen && (
            <div className="profile-dropdown">

              <button
                type="button"
                onClick={() => {
                  setProfileOpen(
                    false
                  );

                  navigate(
                    "/dashboard/profile"
                  );
                }}
              >
                👤 Profile
              </button>

              <button
                type="button"
                onClick={() => {
                  setProfileOpen(
                    false
                  );

                  navigate(
                    "/dashboard/settings"
                  );
                }}
              >
                ⚙️ Settings
              </button>

              <button
                type="button"
                onClick={
                  handleLogout
                }
                className="logout-button"
              >
                🚪 Logout
              </button>

            </div>
          )}

        </div>

      </div>

    </header>
  );
};

export default Navbar;