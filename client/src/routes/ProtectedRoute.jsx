import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  // --------------------------------------------------
  // AUTH CHECK LOADING
  // --------------------------------------------------
  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f5f7ff",
          color: "#26366d",
          fontSize: "18px",
          fontWeight: "600",
        }}
      >
        Loading...
      </div>
    );
  }

  // --------------------------------------------------
  // USER NOT LOGGED IN
  // --------------------------------------------------
  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  // --------------------------------------------------
  // USER LOGGED IN
  // IMPORTANT:
  // AppRoutes.jsx uses nested <Route> elements,
  // so Outlet is required here.
  // --------------------------------------------------
  return <Outlet />;
};

export default ProtectedRoute;