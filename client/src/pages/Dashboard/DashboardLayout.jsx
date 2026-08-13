import React from "react";
import { Outlet } from "react-router-dom";

import Sidebar from "../../components/Sidebar/Sidebar";

import "./DashboardLayout.css";

function DashboardLayout() {
  return (
    <div className="dashboard-layout">

      {/* =========================================
          COMMON SIDEBAR
      ========================================= */}

      <Sidebar />


      {/* =========================================
          ALL PAGE CONTENT
      ========================================= */}

      <main className="dashboard-content">
        <Outlet />
      </main>

    </div>
  );
}

export default DashboardLayout;