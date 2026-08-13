import React, {
  useEffect,
  useState,
} from "react";

import {
  NavLink,
} from "react-router-dom";

import {
  getMe,
} from "../../services/authService";

import "./Sidebar.css";

function Sidebar() {
  const [collapsed, setCollapsed] =
    useState(false);

  const [mobileOpen, setMobileOpen] =
    useState(false);

  const [isAdmin, setIsAdmin] =
    useState(false);

  const [roleLoading, setRoleLoading] =
    useState(true);

  // ============================================================
  // LOAD CURRENT USER
  // ============================================================

  useEffect(() => {
    const loadCurrentUser = async () => {
      try {
        const data = await getMe();

        const currentUser =
          data?.user ||
          data?.data ||
          data;

        const userRole =
          String(
            currentUser?.role ||
              currentUser?.userRole ||
              ""
          ).toLowerCase();

        const adminFlag =
          currentUser?.isAdmin === true ||
          currentUser?.admin === true ||
          currentUser?.user?.isAdmin === true;

        setIsAdmin(
          userRole === "admin" ||
            userRole === "administrator" ||
            adminFlag
        );
      } catch (error) {
        console.error(
          "Sidebar: failed to load user role:",
          error
        );

        setIsAdmin(false);
      } finally {
        setRoleLoading(false);
      }
    };

    loadCurrentUser();
  }, []);

  // ============================================================
  // SIDEBAR WIDTH
  //
  // Desktop:
  //   Open     = 255px
  //   Collapse = 88px
  //
  // Mobile:
  //   Closed = 0px
  //   Open   = 180px
  //
  // IMPORTANT:
  // Mobile sidebar DOES NOT overlay.
  // It pushes the content to the right.
  // ============================================================

  useEffect(() => {
    const updateSidebarWidth = () => {
      const width =
        window.innerWidth;

      if (width <= 600) {
        document.documentElement.style.setProperty(
          "--sidebar-width",
          mobileOpen
            ? "180px"
            : "0px"
        );

        return;
      }

      if (width <= 900) {
        document.documentElement.style.setProperty(
          "--sidebar-width",
          "88px"
        );

        return;
      }

      document.documentElement.style.setProperty(
        "--sidebar-width",
        collapsed
          ? "88px"
          : "255px"
      );
    };

    updateSidebarWidth();

    window.addEventListener(
      "resize",
      updateSidebarWidth
    );

    return () => {
      window.removeEventListener(
        "resize",
        updateSidebarWidth
      );
    };
  }, [
    collapsed,
    mobileOpen,
  ]);

  // ============================================================
  // MOBILE NAVBAR HAMBURGER
  // Navbar থেকে toggleSidebar event আসবে
  // ============================================================

  useEffect(() => {
    const toggleMobileSidebar = () => {
      if (window.innerWidth <= 600) {
        setMobileOpen(
          (previous) => !previous
        );
      }
    };

    window.addEventListener(
      "toggleSidebar",
      toggleMobileSidebar
    );

    return () => {
      window.removeEventListener(
        "toggleSidebar",
        toggleMobileSidebar
      );
    };
  }, []);

  // ============================================================
  // CLOSE MOBILE SIDEBAR AFTER NAVIGATION
  // ============================================================

  const handleNavigation = () => {
    if (window.innerWidth <= 600) {
      setMobileOpen(false);
    }
  };

  // ============================================================
  // USER MENU
  // ============================================================

  const userMenu = [
    {
      to: "/dashboard",
      icon: "🏠",
      label: "Home",
      end: true,
    },
    {
      to: "/dashboard/profile",
      icon: "👤",
      label: "Profile",
    },
    {
      to: "/dashboard/jobs",
      icon: "💼",
      label: "Job",
    },
    {
      to: "/dashboard/create-job",
      icon: "➕",
      label: "Create Job",
    },
    {
      to: "/dashboard/my-job",
      icon: "🗂️",
      label: "My Job",
    },
    {
      to: "/dashboard/my-work",
      icon: "📋",
      label: "My Work",
    },
    {
      to: "/dashboard/depositjob",
      icon: "💰",
      label: "Deposit",
    },
    {
      to: "/dashboard/withdraw",
      icon: "💸",
      label: "Withdraw",
    },
  ];

  // ============================================================
  // ADMIN MENU
  // ============================================================

  const adminMenu = [
    {
      to: "/dashboard/admin/create-job",
      icon: "✅",
      label: "Job Approval",
    },
    {
      to: "/dashboard/admin/deposits",
      icon: "🛡️",
      label: "Admin Deposit",
    },
    {
      to: "/dashboard/admin/withdraw",
      icon: "💸",
      label: "Admin Withdraw",
    },
    {
      to: "/dashboard/admin/users",
      icon: "👥",
      label: "Admin Users",
    },
    {
      to: "/dashboard/admin/notifications",
      icon: "🔔",
      label: "Admin Notification",
    },
     {
  to: "/dashboard/admin/manage-balances",
  icon: "💰",
  label: "Admin Manage Balances",
      },
  ];

  // ============================================================
  // COMMON LINK
  // ============================================================

  const renderLink = (
    item,
    admin = false
  ) => {
    return (
      <NavLink
        key={item.to}
        to={item.to}
        end={item.end}
        onClick={handleNavigation}
        className={({ isActive }) =>
          `sidebar-link ${
            admin
              ? "admin-link"
              : ""
          } ${
            isActive
              ? "active"
              : ""
          }`
        }
      >
        <span className="sidebar-icon">
          {item.icon}
        </span>

        <span className="sidebar-text">
          {item.label}
        </span>
      </NavLink>
    );
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <aside
      className={`
        sidebar
        ${collapsed
          ? "sidebar-collapsed"
          : ""}
        ${mobileOpen
          ? "mobile-open"
          : ""}
      `}
    >

      {/* ======================================================
          DESKTOP SIDEBAR TOGGLE
      ======================================================= */}

      <button
        type="button"
        className="sidebar-toggle"
        onClick={() => {
          if (
            window.innerWidth <= 600
          ) {
            setMobileOpen(
              (previous) => !previous
            );
          } else {
            setCollapsed(
              (previous) => !previous
            );
          }
        }}
        aria-label={
          collapsed
            ? "Open sidebar"
            : "Close sidebar"
        }
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      {/* ======================================================
          MENU
      ======================================================= */}

      <nav className="sidebar-menu">

        {/* USER MENU */}

        {userMenu.map(
          (item) =>
            renderLink(item)
        )}

        {/* ====================================================
            ADMIN
        ===================================================== */}

        {!roleLoading &&
          isAdmin && (
            <>
              <div className="sidebar-section-title">
                <span className="sidebar-text">
                  ADMIN
                </span>
              </div>

              {adminMenu.map(
                (item) =>
                  renderLink(
                    item,
                    true
                  )
              )}
            </>
          )}

        {/* ====================================================
            SUPPORT
            EVERYONE CAN SEE
        ===================================================== */}

        <NavLink
          to="/messages"
          onClick={handleNavigation}
          className={({ isActive }) =>
            `sidebar-link ${
              isActive
                ? "active"
                : ""
            }`
          }
        >
          <span className="sidebar-icon">
            🎧
          </span>

          <span className="sidebar-text">
            Support
          </span>
        </NavLink>

        {/* ====================================================
            SETTINGS
        ===================================================== */}

        <NavLink
          to="/dashboard/settings"
          onClick={handleNavigation}
          className={({ isActive }) =>
            `sidebar-link ${
              isActive
                ? "active"
                : ""
            }`
          }
        >
          <span className="sidebar-icon">
            ⚙️
          </span>

          <span className="sidebar-text">
            Settings
          </span>
        </NavLink>

      </nav>
    </aside>
  );
}

export default Sidebar;