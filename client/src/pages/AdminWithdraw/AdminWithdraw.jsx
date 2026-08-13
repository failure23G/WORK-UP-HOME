import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import "./AdminWithdraw.css";

// ============================================================
// API
// ============================================================

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

// ============================================================
// HELPERS
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
  const number = Number(value || 0);

  return number.toLocaleString(
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

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "-";
  }

  return parsed.toLocaleString(
    "en-US",
    {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  );
};


// ============================================================
// METHOD NAME
// ============================================================

const getMethodName = (method) => {
  const value = String(
    method || ""
  ).toLowerCase();

  if (value === "bkash") {
    return "bKash";
  }

  if (value === "nagad") {
    return "Nagad";
  }

  if (value === "binance") {
    return "Binance";
  }

  return method || "-";
};


// ============================================================
// METHOD ICON
// ============================================================

const getMethodIcon = (method) => {
  const value = String(
    method || ""
  ).toLowerCase();

  if (value === "bkash") {
    return "B";
  }

  if (value === "nagad") {
    return "N";
  }

  if (value === "binance") {
    return "B";
  }

  return "$";
};


// ============================================================
// STATUS CLASS
// ============================================================

const getStatusClass = (status) => {
  const value = String(
    status || ""
  ).toLowerCase();

  if (value === "approved") {
    return "approved";
  }

  if (value === "rejected") {
    return "rejected";
  }

  return "pending";
};


// ============================================================
// COMPONENT
// ============================================================

function AdminWithdraw() {

  const [
    withdraws,
    setWithdraws,
  ] = useState([]);


  const [
    loading,
    setLoading,
  ] = useState(true);


  const [
    actionLoading,
    setActionLoading,
  ] = useState("");


  const [
    error,
    setError,
  ] = useState("");


  const [
    message,
    setMessage,
  ] = useState("");


  const [
    filter,
    setFilter,
  ] = useState("all");


  const [
    search,
    setSearch,
  ] = useState("");


  const [
    refreshing,
    setRefreshing,
  ] = useState(false);


  // ==========================================================
  // FETCH WITHDRAWS
  // ==========================================================

  const fetchWithdraws =
    useCallback(
      async (
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


          const response =
            await fetch(
              `${API_URL}/admin/withdraws`,
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
                "Failed to load withdrawals."
            );
          }


          const list =
            Array.isArray(
              data?.withdraws
            )
              ? data.withdraws
              : Array.isArray(
                  data?.data
                )
              ? data.data
              : [];


          setWithdraws(
            list
          );

        } catch (err) {

          console.error(
            "Admin withdraw fetch error:",
            err
          );


          setError(
            err?.message ||
              "Failed to load withdrawals."
          );

        } finally {

          setLoading(false);

          setRefreshing(false);
        }
      },
      []
    );


  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {

    fetchWithdraws();

  }, [
    fetchWithdraws,
  ]);


  // ==========================================================
  // COUNTS
  // ==========================================================

  const counts =
    useMemo(() => {

      let pending = 0;

      let approved = 0;

      let rejected = 0;


      withdraws.forEach(
        (withdraw) => {

          const status =
            String(
              withdraw?.status ||
                ""
            ).toLowerCase();


          if (
            status ===
            "approved"
          ) {

            approved += 1;

          } else if (
            status ===
            "rejected"
          ) {

            rejected += 1;

          } else {

            pending += 1;
          }
        }
      );


      return {
        all:
          withdraws.length,

        pending,

        approved,

        rejected,
      };

    }, [
      withdraws,
    ]);


  // ==========================================================
  // FILTER + SEARCH
  // ==========================================================

  const filteredWithdraws =
    useMemo(() => {

      const searchValue =
        search
          .trim()
          .toLowerCase();


      return withdraws.filter(
        (withdraw) => {

          const status =
            String(
              withdraw?.status ||
                "pending"
            ).toLowerCase();


          if (
            filter !== "all" &&
            status !== filter
          ) {
            return false;
          }


          if (!searchValue) {
            return true;
          }


          const user =
            withdraw?.user ||
            {};


          const userName =
            String(
              user?.fullName ||
                user?.name ||
                ""
            ).toLowerCase();


          const userEmail =
            String(
              user?.email ||
                ""
            ).toLowerCase();


          const userId =
            String(
              user?.userId ||
                ""
            ).toLowerCase();


          const account =
            String(
              withdraw?.account ||
                ""
            ).toLowerCase();


          const method =
            String(
              withdraw?.method ||
                ""
            ).toLowerCase();


          const withdrawId =
            String(
              withdraw?._id ||
                ""
            ).toLowerCase();


          return (
            userName.includes(
              searchValue
            ) ||

            userEmail.includes(
              searchValue
            ) ||

            userId.includes(
              searchValue
            ) ||

            account.includes(
              searchValue
            ) ||

            method.includes(
              searchValue
            ) ||

            withdrawId.includes(
              searchValue
            )
          );
        }
      );

    }, [
      withdraws,
      filter,
      search,
    ]);


  // ==========================================================
  // APPROVE / REJECT
  // ==========================================================

  const handleAction =
    async (
      withdrawId,
      action
    ) => {

      if (!withdrawId) {
        return;
      }


      const token =
        getToken();


      if (!token) {

        setError(
          "Admin login token not found."
        );

        return;
      }


      const actionName =
        action === "approve"
          ? "Approve"
          : "Reject";


      const confirmed =
        window.confirm(
          `${actionName} this withdrawal request?`
        );


      if (!confirmed) {
        return;
      }


      const loadingKey =
        `${action}-${withdrawId}`;


      try {

        setActionLoading(
          loadingKey
        );


        setError("");

        setMessage("");


        // ====================================================
        // IMPORTANT
        // ====================================================
        //
        // Correct backend route:
        //
        // PATCH /api/admin/withdraws/:id/approve
        // PATCH /api/admin/withdraws/:id/reject
        //
        // NOT:
        //
        // /api/withdraw/admin/:id/approve
        //
        // ====================================================

        const response =
          await fetch(
            `${API_URL}/admin/withdraws/${withdrawId}/${action}`,
            {
              method: "PATCH",

              headers: {
                Authorization:
                  `Bearer ${token}`,

                "Content-Type":
                  "application/json",
              },

              body:
                JSON.stringify({
                  adminNote:
                    action ===
                    "approve"
                      ? "Withdrawal approved by admin."
                      : "Withdrawal rejected by admin.",
                }),
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
              `Failed to ${action} withdrawal.`
          );
        }


        setMessage(
          data?.message ||
            `Withdrawal ${action}d successfully.`
        );


        // ====================================================
        // REFRESH LIST
        // ====================================================

        await fetchWithdraws(
          true
        );

      } catch (err) {

        console.error(
          `Admin withdraw ${action} error:`,
          err
        );


        setError(
          err?.message ||
            `Failed to ${action} withdrawal.`
        );

      } finally {

        setActionLoading("");
      }
    };


  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="admin-withdraw-page">

      {/* ====================================================
          HEADER
      ==================================================== */}

      <div className="admin-withdraw-header">

        <div>

          <span className="admin-withdraw-kicker">
            WORK UP HOME
          </span>


          <h1>
            Admin Withdraw
          </h1>


          <p>
            Review and manage user
            withdrawal requests.
          </p>

        </div>


        <button
          type="button"

          className="withdraw-refresh-button"

          onClick={() =>
            fetchWithdraws(true)
          }

          disabled={
            refreshing ||
            loading
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
          SUCCESS ALERT
      ==================================================== */}

      {message && (

        <div className="admin-withdraw-alert success">

          <span>
            ✓
          </span>


          <div>
            {message}
          </div>


          <button
            type="button"

            onClick={() =>
              setMessage("")
            }
          >
            ×
          </button>

        </div>

      )}


      {/* ====================================================
          ERROR ALERT
      ==================================================== */}

      {error && (

        <div className="admin-withdraw-alert error">

          <span>
            !
          </span>


          <div>
            {error}
          </div>


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
          STAT CARDS
      ==================================================== */}

      <div className="withdraw-stats">


        {/* ALL */}

        <button
          type="button"

          className={
            filter === "all"
              ? "withdraw-stat active"
              : "withdraw-stat"
          }

          onClick={() =>
            setFilter("all")
          }
        >

          <span className="withdraw-stat-icon">
            $
          </span>


          <span className="withdraw-stat-content">

            <small>
              All Requests
            </small>


            <strong>
              {counts.all}
            </strong>

          </span>

        </button>


        {/* PENDING */}

        <button
          type="button"

          className={
            filter === "pending"
              ? "withdraw-stat pending active"
              : "withdraw-stat pending"
          }

          onClick={() =>
            setFilter("pending")
          }
        >

          <span className="withdraw-stat-icon">
            ⏳
          </span>


          <span className="withdraw-stat-content">

            <small>
              Pending
            </small>


            <strong>
              {counts.pending}
            </strong>

          </span>

        </button>


        {/* APPROVED */}

        <button
          type="button"

          className={
            filter === "approved"
              ? "withdraw-stat approved active"
              : "withdraw-stat approved"
          }

          onClick={() =>
            setFilter("approved")
          }
        >

          <span className="withdraw-stat-icon">
            ✓
          </span>


          <span className="withdraw-stat-content">

            <small>
              Approved
            </small>


            <strong>
              {counts.approved}
            </strong>

          </span>

        </button>


        {/* REJECTED */}

        <button
          type="button"

          className={
            filter === "rejected"
              ? "withdraw-stat rejected active"
              : "withdraw-stat rejected"
          }

          onClick={() =>
            setFilter("rejected")
          }
        >

          <span className="withdraw-stat-icon">
            ×
          </span>


          <span className="withdraw-stat-content">

            <small>
              Rejected
            </small>


            <strong>
              {counts.rejected}
            </strong>

          </span>

        </button>

      </div>


      {/* ====================================================
          MAIN CARD
      ==================================================== */}

      <div className="admin-withdraw-card">


        {/* ==================================================
            CARD HEADER
        ================================================== */}

        <div className="admin-withdraw-card-header">

          <div>

            <div className="admin-withdraw-title-row">

              <div className="admin-withdraw-card-icon">
                💸
              </div>


              <div>

                <h2>
                  Withdrawal Requests
                </h2>


                <p>
                  User requests are listed
                  from newest to oldest.
                </p>

              </div>

            </div>

          </div>


          {/* SEARCH */}

          <div className="withdraw-search-box">

            <span>
              🔎
            </span>


            <input
              type="text"

              placeholder="Search user, email, account..."

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

        </div>


        {/* ==================================================
            FILTER BAR
        ================================================== */}

        <div className="withdraw-filter-bar">


          {/* ALL */}

          <button
            type="button"

            className={
              filter === "all"
                ? "active"
                : ""
            }

            onClick={() =>
              setFilter("all")
            }
          >

            All

            <span>
              {counts.all}
            </span>

          </button>


          {/* PENDING */}

          <button
            type="button"

            className={
              filter === "pending"
                ? "active"
                : ""
            }

            onClick={() =>
              setFilter("pending")
            }
          >

            Pending

            <span>
              {counts.pending}
            </span>

          </button>


          {/* APPROVED */}

          <button
            type="button"

            className={
              filter === "approved"
                ? "active"
                : ""
            }

            onClick={() =>
              setFilter("approved")
            }
          >

            Approved

            <span>
              {counts.approved}
            </span>

          </button>


          {/* REJECTED */}

          <button
            type="button"

            className={
              filter === "rejected"
                ? "active"
                : ""
            }

            onClick={() =>
              setFilter("rejected")
            }
          >

            Rejected

            <span>
              {counts.rejected}
            </span>

          </button>

        </div>


        {/* ==================================================
            REQUEST LIST
        ================================================== */}

        <div className="withdraw-scroll">


          {/* LOADING */}

          {loading ? (

            <div className="withdraw-empty">

              <div className="withdraw-spinner" />


              <h3>
                Loading withdrawals...
              </h3>


              <p>
                Please wait.
              </p>

            </div>


          ) : filteredWithdraws.length ===
            0 ? (

            /* =================================================
               EMPTY
            ================================================= */

            <div className="withdraw-empty">

              <div className="withdraw-empty-icon">
                💸
              </div>


              <h3>
                No Withdrawal Requests
              </h3>


              <p>
                No requests match your
                current filter or search.
              </p>

            </div>


          ) : (

            /* =================================================
               LIST
            ================================================= */

            <div className="withdraw-list">

              {filteredWithdraws.map(
                (withdraw) => {

                  const user =
                    withdraw?.user ||
                    {};


                  const status =
                    String(
                      withdraw?.status ||
                        "Pending"
                    );


                  const amount =
                    Number(
                      withdraw?.amount ||
                        0
                    );


                  const fee =
                    Number(
                      withdraw?.fee ??
                        amount * 0.07
                    );


                  const receive =
                    Number(
                      withdraw?.receiveAmount ??
                        amount - fee
                    );


                  const isPending =
                    status
                      .toLowerCase() ===
                    "pending";


                  const approveLoading =
                    actionLoading ===
                    `approve-${withdraw?._id}`;


                  const rejectLoading =
                    actionLoading ===
                    `reject-${withdraw?._id}`;


                  return (

                    <div
                      className="withdraw-request"

                      key={
                        withdraw?._id
                      }
                    >


                      {/* ==================================
                          USER
                      ================================== */}

                      <div className="withdraw-user">

                        <div className="withdraw-user-avatar">

                          {String(
                            user?.fullName ||
                              user?.email ||
                              "U"
                          )
                            .charAt(0)
                            .toUpperCase()}

                        </div>


                        <div className="withdraw-user-info">

                          <strong>
                            {user?.fullName ||
                              user?.name ||
                              "Unknown User"}
                          </strong>


                          <small>
                            {user?.email ||
                              "-"}
                          </small>


                          {user?.userId && (

                            <span>
                              ID:{" "}
                              {
                                user.userId
                              }
                            </span>

                          )}

                        </div>

                      </div>


                      {/* ==================================
                          METHOD
                      ================================== */}

                      <div className="withdraw-method">

                        <div
                          className={`withdraw-method-icon ${String(
                            withdraw?.method ||
                              ""
                          ).toLowerCase()}`}
                        >

                          {getMethodIcon(
                            withdraw?.method
                          )}

                        </div>


                        <div>

                          <strong>
                            {getMethodName(
                              withdraw?.method
                            )}
                          </strong>


                          <small>
                            {withdraw?.account ||
                              "-"}
                          </small>

                        </div>

                      </div>


                      {/* ==================================
                          MONEY
                      ================================== */}

                      <div className="withdraw-money">


                        <div className="money-row">

                          <span>
                            Withdraw
                          </span>


                          <strong>
                            $
                            {formatMoney(
                              amount
                            )}
                          </strong>

                        </div>


                        <div className="money-row fee">

                          <span>
                            Fee 7%
                          </span>


                          <strong>
                            -$
                            {formatMoney(
                              fee
                            )}
                          </strong>

                        </div>


                        <div className="money-line" />


                        <div className="money-row receive">

                          <span>
                            User Receives
                          </span>


                          <strong>
                            $
                            {formatMoney(
                              receive
                            )}
                          </strong>

                        </div>

                      </div>


                      {/* ==================================
                          DATE + STATUS
                      ================================== */}

                      <div className="withdraw-meta">

                        <span className="withdraw-date">

                          {formatDate(
                            withdraw?.createdAt
                          )}

                        </span>


                        <span
                          className={`withdraw-status ${getStatusClass(
                            status
                          )}`}
                        >

                          {status}

                        </span>

                      </div>


                      {/* ==================================
                          ACTIONS
                      ================================== */}

                      <div className="withdraw-actions">


                        {isPending ? (

                          <>

                            {/* APPROVE */}

                            <button
                              type="button"

                              className="withdraw-approve"

                              onClick={() =>
                                handleAction(
                                  withdraw?._id,
                                  "approve"
                                )
                              }

                              disabled={
                                Boolean(
                                  actionLoading
                                )
                              }
                            >

                              {approveLoading
                                ? "Approving..."
                                : "✓ Approve"}

                            </button>


                            {/* REJECT */}

                            <button
                              type="button"

                              className="withdraw-reject"

                              onClick={() =>
                                handleAction(
                                  withdraw?._id,
                                  "reject"
                                )
                              }

                              disabled={
                                Boolean(
                                  actionLoading
                                )
                              }
                            >

                              {rejectLoading
                                ? "Rejecting..."
                                : "× Reject"}

                            </button>

                          </>

                        ) : (

                          <span className="withdraw-completed">
                            {status}
                          </span>

                        )}

                      </div>


                      {/* ==================================
                          REQUEST ID
                      ================================== */}

                      <div className="withdraw-request-id">

                        Request ID:{" "}

                        {withdraw?._id ||
                          "-"}

                      </div>

                    </div>
                  );
                }
              )}

            </div>

          )}

        </div>

      </div>

    </div>
  );
}


// ============================================================
// EXPORT
// ============================================================

export default AdminWithdraw;