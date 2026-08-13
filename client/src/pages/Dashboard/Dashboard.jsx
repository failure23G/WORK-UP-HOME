import { useState } from "react";
import { Outlet } from "react-router-dom";

import Navbar from "../../components/Navbar/Navbar";
import Sidebar from "../../components/Sidebar/Sidebar";

import "./Dashboard.css";

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] =
    useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(
      (previous) => !previous
    );
  };

  return (
    <div
      className={`dashboard-layout ${
        sidebarOpen
          ? ""
          : "sidebar-collapsed"
      }`}
    >

      {/* ======================================
          TOP NAVBAR
      ====================================== */}

      <Navbar />

      {/* ======================================
          DASHBOARD BODY
      ====================================== */}

      <div className="dashboard">

        {/* SIDEBAR */}

        <Sidebar />

        {/* CONTENT */}

        <main className="dashboard-content">
          <Outlet />
        </main>

      </div>

    </div>
  );
};

export default Dashboard;