import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import "./Users.css";

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
    sessionStorage.getItem("token") ||
    sessionStorage.getItem("accessToken") ||
    ""
  );
};


// ============================================================
// MONEY
// ============================================================

const formatMoney = (value) => {
  return Number(
    value || 0
  ).toLocaleString(
    "en-US",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  );
};


// ============================================================
// DATE
// ============================================================

const formatDate = (date) => {
  if (!date) {
    return "-";
  }

  const parsed =
    new Date(date);

  if (
    Number.isNaN(
      parsed.getTime()
    )
  ) {
    return "-";
  }

  return parsed.toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    }
  );
};


// ============================================================
// USER INITIAL
// ============================================================

const getInitial = (user) => {
  const name =
    user?.fullName ||
    user?.name ||
    user?.email ||
    "U";

  return name
    .charAt(0)
    .toUpperCase();
};


// ============================================================
// COMPONENT
// ============================================================

function Users() {

  const [
    users,
    setUsers,
  ] = useState([]);


  const [
    loading,
    setLoading,
  ] = useState(true);


  const [
    refreshing,
    setRefreshing,
  ] = useState(false);


  const [
    error,
    setError,
  ] = useState("");


  const [
    search,
    setSearch,
  ] = useState("");


  const [
    selectedUser,
    setSelectedUser,
  ] = useState(null);


  // ==========================================================
  // FETCH USERS
  // ==========================================================

  const fetchUsers = async (
    showRefresh = false
  ) => {

    const token =
      getToken();


    if (!token) {

      setError(
        "Admin login token not found."
      );

      setLoading(false);

      return;
    }


    try {

      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }


      setError("");


      /*
      ==========================================================
      IMPORTANT

      Existing backend route for admin users is not confirmed
      in the current project files.

      This request assumes:

      GET /api/admin/users

      ==========================================================
      */

      const response =
        await fetch(
          `${API_URL}/admin/users`,
          {
            method: "GET",

            headers: {
              Authorization:
                `Bearer ${token}`,

              "Content-Type":
                "application/json",
            },
          }
        );


      const data =
        await response
          .json()
          .catch(
            () => ({})
          );


      if (!response.ok) {

        throw new Error(
          data?.message ||
            "Failed to load users."
        );
      }


      const list =
        Array.isArray(
          data?.users
        )
          ? data.users
          : Array.isArray(
              data?.data
            )
          ? data.data
          : Array.isArray(
              data
            )
          ? data
          : [];


      setUsers(
        list
      );

    } catch (err) {

      console.error(
        "Admin users error:",
        err
      );


      setError(
        err?.message ||
          "Failed to load users."
      );

    } finally {

      setLoading(false);

      setRefreshing(false);
    }
  };


  // ==========================================================
  // LOAD
  // ==========================================================

  useEffect(() => {

    fetchUsers();

  }, []);


  // ==========================================================
  // SEARCH
  // ==========================================================

  const filteredUsers =
    useMemo(() => {

      const text =
        search
          .trim()
          .toLowerCase();


      if (!text) {
        return users;
      }


      return users.filter(
        (user) => {

          const userId =
            String(
              user?.userId ||
                ""
            ).toLowerCase();


          const name =
            String(
              user?.fullName ||
                user?.name ||
                ""
            ).toLowerCase();


          const email =
            String(
              user?.email ||
                ""
            ).toLowerCase();


          const phone =
            String(
              user?.phone ||
                ""
            ).toLowerCase();


          return (
            userId.includes(
              text
            ) ||

            name.includes(
              text
            ) ||

            email.includes(
              text
            ) ||

            phone.includes(
              text
            )
          );
        }
      );

    }, [
      users,
      search,
    ]);


  // ==========================================================
  // CLOSE PROFILE
  // ==========================================================

  const closeProfile = () => {
    setSelectedUser(
      null
    );
  };


  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="admin-users-page">


      {/* ====================================================
          HEADER
      ==================================================== */}

      <div className="admin-users-header">

        <div>

          <span className="admin-users-kicker">
            ADMIN PANEL
          </span>


          <h1>
            User Profiles
          </h1>


          <p>
            View user IDs and check
            complete user profiles.
          </p>

        </div>


        <button
          type="button"

          className="users-refresh-button"

          onClick={() =>
            fetchUsers(true)
          }

          disabled={
            loading ||
            refreshing
          }
        >

          <span>
            ↻
          </span>


          {refreshing
            ? "Refreshing..."
            : "Refresh"}

        </button>

      </div>


      {/* ====================================================
          ERROR
      ==================================================== */}

      {error && (

        <div className="users-error">

          <span>
            !
          </span>


          <p>
            {error}
          </p>


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


      {/* ====================================================
          SEARCH
      ==================================================== */}

      <div className="users-toolbar">

        <div className="users-search">

          <span>
            🔍
          </span>


          <input
            type="text"

            placeholder="Search User ID, name, email or phone..."

            value={
              search
            }

            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
          />


          {search && (

            <button
              type="button"

              onClick={() =>
                setSearch("")
              }
            >
              ×
            </button>

          )}

        </div>


        <div className="users-count">

          <strong>
            {filteredUsers.length}
          </strong>


          <span>
            {search
              ? "Matching Users"
              : "Total Users"}
          </span>

        </div>

      </div>


      {/* ====================================================
          USER LIST
      ==================================================== */}

      <div className="users-card">

        <div className="users-card-header">

          <div>

            <h2>
              User ID List
            </h2>


            <p>
              Click View Profile to
              inspect a user's details.
            </p>

          </div>


          <div className="users-header-badge">
            👥 {users.length}
          </div>

        </div>


        {/* ==================================================
            LOADING
        ================================================== */}

        {loading ? (

          <div className="users-empty">

            <div className="users-spinner" />


            <h3>
              Loading Users...
            </h3>


            <p>
              Please wait.
            </p>

          </div>


        ) : filteredUsers.length ===
          0 ? (

          /* =================================================
             EMPTY
          ================================================= */

          <div className="users-empty">

            <div className="users-empty-icon">
              👥
            </div>


            <h3>
              No Users Found
            </h3>


            <p>
              {search
                ? "No user matches your search."
                : "There are no users to display."}
            </p>

          </div>


        ) : (

          /* =================================================
             TABLE
          ================================================= */

          <div className="users-table-wrapper">

            <table className="users-table">

              <thead>

                <tr>

                  <th>
                    User
                  </th>

                  <th>
                    User ID
                  </th>

                  <th>
                    Email
                  </th>

                  <th>
                    Phone
                  </th>

                  <th>
                    Wallet
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                    Joined
                  </th>

                  <th>
                    Action
                  </th>

                </tr>

              </thead>


              <tbody>

                {filteredUsers.map(
                  (user) => {

                    const isBlocked =
                      Boolean(
                        user?.isBlocked
                      );


                    return (

                      <tr
                        key={
                          user?._id ||
                          user?.userId
                        }
                      >


                        {/* USER */}

                        <td>

                          <div className="user-cell">

                            <div className="user-avatar">

                              {user?.profileImage ? (

                                <img
                                  src={
                                    user.profileImage
                                  }

                                  alt={
                                    user?.fullName ||
                                    "User"
                                  }
                                />

                              ) : (

                                <span>
                                  {getInitial(
                                    user
                                  )}
                                </span>

                              )}

                            </div>


                            <div className="user-name-block">

                              <strong>
                                {user?.fullName ||
                                  user?.name ||
                                  "Unknown User"}
                              </strong>


                              <small>
                                {user?.role ||
                                  "user"}
                              </small>

                            </div>

                          </div>

                        </td>


                        {/* USER ID */}

                        <td>

                          <span className="user-id-badge">

                            {user?.userId ||
                              "-"}

                          </span>

                        </td>


                        {/* EMAIL */}

                        <td>

                          <span className="user-email">

                            {user?.email ||
                              "-"}

                          </span>

                        </td>


                        {/* PHONE */}

                        <td>

                          {user?.phone ||
                            "-"}

                        </td>


                        {/* WALLET */}

                        <td>

                          <strong className="wallet-value">

                            $
                            {formatMoney(
                              user?.wallet
                            )}

                          </strong>

                        </td>


                        {/* STATUS */}

                        <td>

                          <span
                            className={
                              isBlocked
                                ? "user-status blocked"
                                : "user-status active"
                            }
                          >

                            {isBlocked
                              ? "Blocked"
                              : "Active"}

                          </span>

                        </td>


                        {/* JOINED */}

                        <td>

                          {formatDate(
                            user?.createdAt
                          )}

                        </td>


                        {/* ACTION */}

                        <td>

                          <button
                            type="button"

                            className="view-profile-button"

                            onClick={() =>
                              setSelectedUser(
                                user
                              )
                            }
                          >

                            👁 View Profile

                          </button>

                        </td>

                      </tr>

                    );
                  }
                )}

              </tbody>

            </table>

          </div>

        )}

      </div>


      {/* ====================================================
          PROFILE MODAL
      ==================================================== */}

      {selectedUser && (

        <div
          className="user-profile-overlay"

          onMouseDown={(event) => {

            if (
              event.target ===
              event.currentTarget
            ) {
              closeProfile();
            }

          }}
        >

          <div className="user-profile-modal">


            {/* ==============================================
                PROFILE HEADER
            ============================================== */}

            <div className="user-profile-header">

              <div className="profile-user-main">

                <div className="profile-avatar">

                  {selectedUser?.profileImage ? (

                    <img
                      src={
                        selectedUser.profileImage
                      }

                      alt={
                        selectedUser?.fullName ||
                        "User"
                      }
                    />

                  ) : (

                    <span>
                      {getInitial(
                        selectedUser
                      )}
                    </span>

                  )}

                </div>


                <div>

                  <span className="profile-label">
                    USER PROFILE
                  </span>


                  <h2>
                    {selectedUser?.fullName ||
                      selectedUser?.name ||
                      "Unknown User"}
                  </h2>


                  <p>
                    ID:{" "}
                    {selectedUser?.userId ||
                      "-"}
                  </p>

                </div>

              </div>


              <button
                type="button"

                className="profile-close"

                onClick={
                  closeProfile
                }
              >
                ×
              </button>

            </div>


            {/* ==============================================
                PROFILE BODY
            ============================================== */}

            <div className="user-profile-body">


              {/* ============================================
                  MONEY CARDS
              ============================================ */}

              <div className="profile-money-grid">


                <div className="profile-money-card">

                  <span>
                    Wallet
                  </span>


                  <strong>
                    $
                    {formatMoney(
                      selectedUser?.wallet
                    )}
                  </strong>

                </div>


                <div className="profile-money-card">

                  <span>
                    Earning
                  </span>


                  <strong>
                    $
                    {formatMoney(
                      selectedUser?.earning
                    )}
                  </strong>

                </div>


                <div className="profile-money-card">

                  <span>
                    Deposit
                  </span>


                  <strong>
                    $
                    {formatMoney(
                      selectedUser?.deposit
                    )}
                  </strong>

                </div>

              </div>


              {/* ============================================
                  BASIC INFORMATION
              ============================================ */}

              <div className="profile-section">

                <div className="profile-section-title">

                  <span>
                    👤
                  </span>


                  <h3>
                    Personal Information
                  </h3>

                </div>


                <div className="profile-info-grid">


                  <div>

                    <label>
                      User ID
                    </label>


                    <strong>
                      {selectedUser?.userId ||
                        "-"}
                    </strong>

                  </div>


                  <div>

                    <label>
                      Full Name
                    </label>


                    <strong>
                      {selectedUser?.fullName ||
                        selectedUser?.name ||
                        "-"}
                    </strong>

                  </div>


                  <div>

                    <label>
                      Email
                    </label>


                    <strong>
                      {selectedUser?.email ||
                        "-"}
                    </strong>

                  </div>


                  <div>

                    <label>
                      Phone
                    </label>


                    <strong>
                      {selectedUser?.phone ||
                        "-"}
                    </strong>

                  </div>


                  <div>

                    <label>
                      Role
                    </label>


                    <strong>
                      {selectedUser?.role ||
                        "user"}
                    </strong>

                  </div>


                  <div>

                    <label>
                      Verification
                    </label>


                    <strong>

                      {selectedUser?.isVerified
                        ? "✓ Verified"
                        : "Not Verified"}

                    </strong>

                  </div>


                  <div>

                    <label>
                      Account Status
                    </label>


                    <strong>

                      {selectedUser?.isBlocked
                        ? "Blocked"
                        : "Active"}

                    </strong>

                  </div>


                  <div>

                    <label>
                      Joined
                    </label>


                    <strong>
                      {formatDate(
                        selectedUser?.createdAt
                      )}
                    </strong>

                  </div>

                </div>

              </div>


              {/* ============================================
                  BIO
              ============================================ */}

              <div className="profile-section">

                <div className="profile-section-title">

                  <span>
                    📝
                  </span>


                  <h3>
                    Bio
                  </h3>

                </div>


                <div className="profile-bio">

                  {selectedUser?.bio
                    ? selectedUser.bio
                    : "No bio added by this user."}

                </div>

              </div>


              {/* ============================================
                  MESSAGE
              ============================================ */}

              <div className="profile-message-box">

                <div>

                  <strong>
                    💬 Contact User
                  </strong>


                  <p>
                    You can reply to this
                    user's support conversation.
                  </p>

                </div>


                <button
                  type="button"

                  onClick={() => {

                    /*
                    ==========================================
                    Existing message backend accepts receiverId.
                    The actual Messages page can select this user.
                    ==========================================
                    */

                    window.location.href =
                      `/admin/messages?user=${selectedUser?._id}`;

                  }}
                >

                  Message User

                </button>

              </div>

            </div>


            {/* ==============================================
                FOOTER
            ============================================== */}

            <div className="user-profile-footer">

              <button
                type="button"

                onClick={
                  closeProfile
                }
              >

                Close

              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}


// ============================================================
// EXPORT
// ============================================================

export default Users;