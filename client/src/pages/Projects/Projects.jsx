import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const Projects = () => {
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [loading, setLoading] = useState(false);

  // =========================================================
  // LOAD PROJECTS
  // =========================================================

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);

      /*
        Backend API ready না থাকলেও page blank হবে না।
        পরে এখানে তোমার project API connect করা যাবে।
      */

      const savedProjects =
        JSON.parse(localStorage.getItem("workUpHomeProjects")) || [];

      setProjects(savedProjects);
    } catch (error) {
      console.error("Failed to load projects:", error);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // FILTER PROJECTS
  // =========================================================

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const title =
        project?.title ||
        project?.name ||
        "";

      const description =
        project?.description ||
        "";

      const status =
        project?.status ||
        "PENDING";

      const searchText =
        `${title} ${description}`.toLowerCase();

      const matchesSearch =
        searchText.includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "ALL" ||
        status.toUpperCase() === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [projects, search, statusFilter]);

  // =========================================================
  // STATUS COLOR
  // =========================================================

  const getStatusStyle = (status) => {
    const value = String(status || "PENDING").toUpperCase();

    if (value === "COMPLETED" || value === "APPROVED") {
      return {
        background: "#dcfce7",
        color: "#15803d",
      };
    }

    if (value === "REJECTED" || value === "CANCELLED") {
      return {
        background: "#fee2e2",
        color: "#dc2626",
      };
    }

    if (value === "IN_PROGRESS") {
      return {
        background: "#dbeafe",
        color: "#2563eb",
      };
    }

    return {
      background: "#fef3c7",
      color: "#d97706",
    };
  };

  // =========================================================
  // PROJECT CARD
  // =========================================================

  const ProjectCard = ({ project }) => {
    const title =
      project?.title ||
      project?.name ||
      "Untitled Project";

    const description =
      project?.description ||
      "No project description available.";

    const status =
      project?.status ||
      "PENDING";

    const budget =
      project?.budget ??
      project?.amount ??
      0;

    const category =
      project?.category ||
      "General";

    const createdAt =
      project?.createdAt ||
      project?.created_at ||
      null;

    return (
      <div
        style={{
          background: "#ffffff",
          borderRadius: "18px",
          padding: "24px",
          marginBottom: "18px",
          border: "1px solid #e7eaf5",
          boxShadow: "0 8px 25px rgba(49, 67, 140, 0.06)",
        }}
      >

        {/* TOP */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: "20px",
          }}
        >

          <div style={{ flex: 1 }}>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "10px",
                flexWrap: "wrap",
              }}
            >
              <h3
                style={{
                  margin: 0,
                  color: "#172554",
                  fontSize: "20px",
                  fontWeight: "700",
                }}
              >
                {title}
              </h3>

              <span
                style={{
                  padding: "5px 11px",
                  borderRadius: "20px",
                  fontSize: "11px",
                  fontWeight: "700",
                  ...getStatusStyle(status),
                }}
              >
                {String(status).replaceAll("_", " ")}
              </span>
            </div>

            <p
              style={{
                margin: "0 0 14px",
                color: "#7180a5",
                fontSize: "14px",
                lineHeight: "1.6",
              }}
            >
              {description}
            </p>

            <div
              style={{
                display: "flex",
                gap: "18px",
                flexWrap: "wrap",
                color: "#68759b",
                fontSize: "13px",
              }}
            >
              <span>
                📁 {category}
              </span>

              <span>
                💰 ${Number(budget).toFixed(2)}
              </span>

              {createdAt && (
                <span>
                  📅{" "}
                  {new Date(createdAt).toLocaleDateString()}
                </span>
              )}
            </div>

          </div>

        </div>

      </div>
    );
  };

  // =========================================================
  // EMPTY STATE
  // =========================================================

  const EmptyState = () => {
    return (
      <div
        style={{
          background: "#ffffff",
          borderRadius: "20px",
          padding: "65px 25px",
          textAlign: "center",
          border: "1px solid #e7eaf5",
          boxShadow: "0 8px 25px rgba(49, 67, 140, 0.05)",
        }}
      >

        <div
          style={{
            width: "70px",
            height: "70px",
            margin: "0 auto 18px",
            borderRadius: "20px",
            background: "#f0eaff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "32px",
          }}
        >
          📁
        </div>

        <h3
          style={{
            margin: "0 0 8px",
            color: "#172554",
            fontSize: "21px",
          }}
        >
          No projects found
        </h3>

        <p
          style={{
            margin: 0,
            color: "#7b87a8",
            fontSize: "14px",
          }}
        >
          There are no projects matching your search right now.
        </p>

      </div>
    );
  };

  // =========================================================
  // MAIN UI
  // =========================================================

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f5f7ff",
        padding: "35px 45px",
        boxSizing: "border-box",
      }}
    >

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div
        style={{
          maxWidth: "1000px",
          margin: "0 auto 30px",
        }}
      >

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "20px",
            marginBottom: "28px",
            flexWrap: "wrap",
          }}
        >

          <div>

            <div
              style={{
                color: "#633cff",
                fontSize: "12px",
                fontWeight: "800",
                letterSpacing: "3px",
                marginBottom: "8px",
              }}
            >
              WORK UP HOME
            </div>

            <h1
              style={{
                margin: 0,
                color: "#172554",
                fontSize: "34px",
                fontWeight: "800",
              }}
            >
              My Projects
            </h1>

            <p
              style={{
                margin: "8px 0 0",
                color: "#7180a5",
                fontSize: "15px",
              }}
            >
              Manage and track your projects.
            </p>

          </div>

          <button
            type="button"
            onClick={() => navigate("/jobs")}
            style={{
              border: "none",
              borderRadius: "12px",
              padding: "13px 22px",
              background:
                "linear-gradient(135deg, #743cff, #315eea)",
              color: "#ffffff",
              fontWeight: "700",
              fontSize: "14px",
              cursor: "pointer",
              boxShadow:
                "0 8px 20px rgba(86, 65, 220, 0.25)",
            }}
          >
            Browse Jobs
          </button>

        </div>

        {/* ===================================================
            SEARCH
        =================================================== */}

        <div
          style={{
            background: "#ffffff",
            borderRadius: "18px",
            padding: "14px",
            border: "1px solid #e4e8f4",
            display: "flex",
            gap: "12px",
            alignItems: "center",
            flexWrap: "wrap",
            boxShadow:
              "0 8px 25px rgba(49, 67, 140, 0.05)",
          }}
        >

          <div
            style={{
              flex: 1,
              minWidth: "220px",
              position: "relative",
            }}
          >

            <span
              style={{
                position: "absolute",
                left: "16px",
                top: "50%",
                transform: "translateY(-50%)",
                fontSize: "18px",
              }}
            >
              🔎
            </span>

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search projects..."
              style={{
                width: "100%",
                boxSizing: "border-box",
                border: "1px solid #e1e6f4",
                background: "#f8faff",
                borderRadius: "12px",
                padding: "14px 16px 14px 45px",
                outline: "none",
                color: "#24325e",
                fontSize: "14px",
              }}
            />

          </div>

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value)
            }
            style={{
              border: "1px solid #e1e6f4",
              background: "#f8faff",
              borderRadius: "12px",
              padding: "13px 16px",
              color: "#44527c",
              outline: "none",
              fontSize: "14px",
              minWidth: "150px",
              cursor: "pointer",
            }}
          >
            <option value="ALL">
              All Status
            </option>

            <option value="PENDING">
              Pending
            </option>

            <option value="IN_PROGRESS">
              In Progress
            </option>

            <option value="COMPLETED">
              Completed
            </option>

            <option value="APPROVED">
              Approved
            </option>

            <option value="REJECTED">
              Rejected
            </option>
          </select>

          <button
            type="button"
            onClick={loadProjects}
            style={{
              border: "none",
              borderRadius: "11px",
              padding: "13px 18px",
              background: "#633cff",
              color: "#ffffff",
              fontWeight: "700",
              cursor: "pointer",
            }}
          >
            ↻ Refresh
          </button>

        </div>

      </div>

      {/* =====================================================
          PROJECT COUNT
      ===================================================== */}

      <div
        style={{
          maxWidth: "1000px",
          margin: "0 auto 15px",
          color: "#7180a5",
          fontSize: "14px",
        }}
      >
        <strong
          style={{
            color: "#633cff",
            fontSize: "18px",
          }}
        >
          {filteredProjects.length}
        </strong>{" "}
        {filteredProjects.length === 1
          ? "project"
          : "projects"}{" "}
        available
      </div>

      {/* =====================================================
          PROJECT LIST
      ===================================================== */}

      <div
        style={{
          maxWidth: "1000px",
          margin: "0 auto",
        }}
      >

        {loading ? (
          <div
            style={{
              background: "#ffffff",
              borderRadius: "20px",
              padding: "60px",
              textAlign: "center",
              color: "#633cff",
              fontWeight: "700",
            }}
          >
            Loading projects...
          </div>
        ) : filteredProjects.length === 0 ? (
          <EmptyState />
        ) : (
          filteredProjects.map((project, index) => (
            <ProjectCard
              key={
                project?._id ||
                project?.id ||
                index
              }
              project={project}
            />
          ))
        )}

      </div>

    </div>
  );
};

export default Projects;