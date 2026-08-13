import React, { useEffect, useState } from "react";
import "./AdminDeposits.css";

const API_URL = "https://work-up-home.onrender.com";

function AdminDeposits() {
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  const [message, setMessage] = useState({
    type: "",
    text: "",
  });

  const [rejectModal, setRejectModal] = useState({
    open: false,
    deposit: null,
  });

  const [rejectionReason, setRejectionReason] =
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
  // LOAD PENDING DEPOSITS
  // ==================================================

  const loadDeposits = async () => {
    try {
      setLoading(true);

      const token = getToken();

      if (!token) {
        setMessage({
          type: "error",
          text: "Admin login token not found.",
        });

        return;
      }

      const response = await fetch(
        `${API_URL}/api/admin/deposits/pending`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to load deposits."
        );
      }

      setDeposits(data.deposits || []);
    } catch (error) {
      console.error(
        "Load admin deposits error:",
        error
      );

      setMessage({
        type: "error",
        text:
          error.message ||
          "Failed to load deposits.",
      });
    } finally {
      setLoading(false);
    }
  };

  // ==================================================
  // INITIAL LOAD
  // ==================================================

  useEffect(() => {
    loadDeposits();
  }, []);

  // ==================================================
  // APPROVE DEPOSIT
  // ==================================================

  const handleApprove = async (deposit) => {
    const confirmed = window.confirm(
      `Approve ${formatUsd(
        deposit.netUsd
      )} for ${
        deposit.user?.fullName ||
        deposit.user?.userId ||
        "this user"
      }?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setProcessingId(deposit._id);

      const token = getToken();

      const response = await fetch(
        `${API_URL}/api/admin/deposits/${deposit._id}/approve`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            adminNote:
              "Deposit approved from admin dashboard.",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to approve deposit."
        );
      }

      setMessage({
        type: "success",
        text:
          data.message ||
          "Deposit approved successfully.",
      });

      setDeposits((current) =>
        current.filter(
          (item) =>
            item._id !== deposit._id
        )
      );
    } catch (error) {
      console.error(
        "Approve deposit error:",
        error
      );

      setMessage({
        type: "error",
        text:
          error.message ||
          "Failed to approve deposit.",
      });
    } finally {
      setProcessingId(null);
    }
  };

  // ==================================================
  // OPEN REJECT MODAL
  // ==================================================

  const openRejectModal = (deposit) => {
    setRejectionReason("");

    setRejectModal({
      open: true,
      deposit,
    });
  };

  // ==================================================
  // CLOSE REJECT MODAL
  // ==================================================

  const closeRejectModal = () => {
    setRejectModal({
      open: false,
      deposit: null,
    });

    setRejectionReason("");
  };

  // ==================================================
  // REJECT DEPOSIT
  // ==================================================

  const handleReject = async () => {
    const deposit =
      rejectModal.deposit;

    if (!deposit) {
      return;
    }

    if (!rejectionReason.trim()) {
      setMessage({
        type: "error",
        text:
          "Please enter a rejection reason.",
      });

      return;
    }

    try {
      setProcessingId(deposit._id);

      const token = getToken();

      const response = await fetch(
        `${API_URL}/api/admin/deposits/${deposit._id}/reject`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            rejectionReason:
              rejectionReason.trim(),

            adminNote:
              "Deposit rejected from admin dashboard.",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to reject deposit."
        );
      }

      setMessage({
        type: "success",
        text:
          data.message ||
          "Deposit rejected successfully.",
      });

      setDeposits((current) =>
        current.filter(
          (item) =>
            item._id !== deposit._id
        )
      );

      closeRejectModal();
    } catch (error) {
      console.error(
        "Reject deposit error:",
        error
      );

      setMessage({
        type: "error",
        text:
          error.message ||
          "Failed to reject deposit.",
      });
    } finally {
      setProcessingId(null);
    }
  };

  // ==================================================
  // FORMAT USD
  // ==================================================

  const formatUsd = (amount) => {
    const value = Number(amount || 0);

    return `$${value.toFixed(2)}`;
  };

  // ==================================================
  // FORMAT BDT
  // ==================================================

  const formatBdt = (amount) => {
    const value = Number(amount || 0);

    return `৳${value.toFixed(2)}`;
  };

  // ==================================================
  // FORMAT DATE
  // ==================================================

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    return new Date(date).toLocaleString(
      "en-BD",
      {
        dateStyle: "medium",
        timeStyle: "short",
      }
    );
  };

  // ==================================================
  // PAYMENT METHOD
  // ==================================================

  const getMethodClass = (method) => {
    if (method === "bkash") {
      return "bkash";
    }

    if (method === "nagad") {
      return "nagad";
    }

    if (method === "binance") {
      return "binance";
    }

    return "";
  };

  const getMethodLabel = (method) => {
    if (method === "bkash") {
      return "bKash";
    }

    if (method === "nagad") {
      return "Nagad";
    }

    if (method === "binance") {
      return "Binance";
    }

    return method || "Unknown";
  };

  // ==================================================
  // SUMMARY
  // ==================================================

  const totalPending = deposits.length;

  const totalBdt = deposits.reduce(
    (total, deposit) =>
      total +
      Number(
        deposit.bdtAmount || 0
      ),
    0
  );

  const totalGrossUsd = deposits.reduce(
    (total, deposit) =>
      total +
      Number(
        deposit.grossUsd || 0
      ),
    0
  );

  const totalFees = deposits.reduce(
    (total, deposit) =>
      total +
      Number(
        deposit.feeUsd || 0
      ),
    0
  );

  const totalNetUsd = deposits.reduce(
    (total, deposit) =>
      total +
      Number(
        deposit.netUsd || 0
      ),
    0
  );

  // ==================================================
  // RENDER
  // ==================================================

  return (
    <div className="admin-deposits-page">

      {/* ==============================================
          HEADER
      ============================================== */}

      <div className="admin-deposits-header">

        <div>
          <span className="admin-deposits-kicker">
            FINANCE CONTROL
          </span>

          <h1>
            Deposit Requests
          </h1>

          <p>
            Review user deposit requests,
            verify transactions and manage
            approvals.
          </p>
        </div>

        <button
          type="button"
          className="refresh-deposits-btn"
          onClick={loadDeposits}
          disabled={loading}
        >
          <span>
            ↻
          </span>

          {loading
            ? "Loading..."
            : "Refresh"}
        </button>

      </div>


      {/* ==============================================
          MESSAGE
      ============================================== */}

      {message.text && (
        <div
          className={`admin-deposit-alert ${
            message.type
          }`}
        >
          <span className="alert-icon">
            {message.type === "success"
              ? "✓"
              : "!"}
          </span>

          <span>
            {message.text}
          </span>

          <button
            type="button"
            onClick={() =>
              setMessage({
                type: "",
                text: "",
              })
            }
          >
            ×
          </button>
        </div>
      )}


      {/* ==============================================
          SUMMARY CARDS
      ============================================== */}

      <div className="deposit-summary-grid">

        <div className="deposit-summary-card pending-card">
          <div className="summary-icon">
            ⏳
          </div>

          <div>
            <span>
              Pending Requests
            </span>

            <strong>
              {totalPending}
            </strong>
          </div>
        </div>


        <div className="deposit-summary-card">
          <div className="summary-icon bdt-icon">
            ৳
          </div>

          <div>
            <span>
              Pending BDT
            </span>

            <strong>
              {formatBdt(totalBdt)}
            </strong>
          </div>
        </div>


        <div className="deposit-summary-card">
          <div className="summary-icon usd-icon">
            $
          </div>

          <div>
            <span>
              Gross USD
            </span>

            <strong>
              {formatUsd(
                totalGrossUsd
              )}
            </strong>
          </div>
        </div>


        <div className="deposit-summary-card">
          <div className="summary-icon net-icon">
            $
          </div>

          <div>
            <span>
              Net To Users
            </span>

            <strong>
              {formatUsd(
                totalNetUsd
              )}
            </strong>
          </div>
        </div>

      </div>


      {/* ==============================================
          DEPOSIT TABLE CARD
      ============================================== */}

      <div className="admin-deposit-card">

        <div className="admin-deposit-card-header">

          <div>
            <span className="table-kicker">
              PENDING QUEUE
            </span>

            <h2>
              Deposit Requests
            </h2>

            <p>
              Approve only after verifying
              the transaction details.
            </p>
          </div>

          <div className="fee-badge">
            7% Fee
          </div>

        </div>


        {/* ============================================
            LOADING
        ============================================ */}

        {loading ? (
          <div className="admin-deposit-empty">

            <div className="admin-loading-spinner" />

            <h3>
              Loading deposits...
            </h3>

            <p>
              Please wait while we fetch
              pending deposit requests.
            </p>

          </div>
        ) : deposits.length === 0 ? (

          /* ==========================================
             EMPTY
          ========================================== */

          <div className="admin-deposit-empty">

            <div className="admin-empty-icon">
              ✓
            </div>

            <h3>
              No Pending Deposits
            </h3>

            <p>
              There are currently no deposit
              requests waiting for approval.
            </p>

            <button
              type="button"
              onClick={loadDeposits}
            >
              Refresh Requests
            </button>

          </div>

        ) : (

          /* ==========================================
             TABLE
          ========================================== */

          <div className="deposit-table-wrapper">

            <table className="deposit-table">

              <thead>
                <tr>

                  <th>
                    User
                  </th>

                  <th>
                    Method
                  </th>

                  <th>
                    Amount
                  </th>

                  <th>
                    Fee
                  </th>

                  <th>
                    Net USD
                  </th>

                  <th>
                    Transaction
                  </th>

                  <th>
                    Date
                  </th>

                  <th>
                    Action
                  </th>

                </tr>
              </thead>


              <tbody>

                {deposits.map(
                  (deposit) => {

                    const isProcessing =
                      processingId ===
                      deposit._id;

                    return (
                      <tr
                        key={
                          deposit._id
                        }
                      >

                        {/* USER */}

                        <td>
                          <div className="deposit-user">

                            <div className="user-avatar">
                              {(
                                deposit
                                  .user
                                  ?.fullName ||
                                deposit
                                  .user
                                  ?.userId ||
                                "U"
                              )
                                .charAt(0)
                                .toUpperCase()}
                            </div>

                            <div className="user-details">

                              <strong>
                                {
                                  deposit
                                    .user
                                    ?.fullName ||
                                  "Unknown User"
                                }
                              </strong>

                              <span>
                                {deposit.user
                                  ?.userId
                                  ? `@${deposit.user.userId}`
                                  : deposit.user
                                      ?.email ||
                                    "No email"}
                              </span>

                            </div>

                          </div>
                        </td>


                        {/* METHOD */}

                        <td>

                          <div
                            className={`admin-method ${getMethodClass(
                              deposit.method
                            )}`}
                          >

                            <span className="admin-method-icon">
                              {deposit.method ===
                              "bkash"
                                ? "B"
                                : deposit.method ===
                                  "nagad"
                                ? "N"
                                : "₿"}
                            </span>

                            <span>
                              {getMethodLabel(
                                deposit.method
                              )}
                            </span>

                          </div>

                        </td>


                        {/* AMOUNT */}

                        <td>

                          <div className="deposit-amount-cell">

                            <strong>
                              {formatBdt(
                                deposit.bdtAmount
                              )}
                            </strong>

                            <span>
                              ≈{" "}
                              {formatUsd(
                                deposit.grossUsd
                              )}
                            </span>

                          </div>

                        </td>


                        {/* FEE */}

                        <td>

                          <div className="deposit-fee-cell">

                            <strong>
                              -{" "}
                              {formatUsd(
                                deposit.feeUsd
                              )}
                            </strong>

                            <span>
                              {deposit.feePercent ||
                                7}
                              %
                            </span>

                          </div>

                        </td>


                        {/* NET */}

                        <td>

                          <strong className="net-usd">
                            {formatUsd(
                              deposit.netUsd
                            )}
                          </strong>

                        </td>


                        {/* TRANSACTION */}

                        <td>

                          <div className="transaction-cell">

                            <code>
                              {
                                deposit.transactionId ||
                                "-"
                              }
                            </code>

                            <button
                              type="button"
                              title="Copy transaction ID"
                              onClick={() => {
                                navigator.clipboard
                                  ?.writeText(
                                    deposit.transactionId ||
                                      ""
                                  );

                                setMessage({
                                  type: "success",
                                  text:
                                    "Transaction ID copied.",
                                });
                              }}
                            >
                              ⧉
                            </button>

                          </div>

                        </td>


                        {/* DATE */}

                        <td>

                          <span className="deposit-date">
                            {formatDate(
                              deposit.createdAt
                            )}
                          </span>

                        </td>


                        {/* ACTION */}

                        <td>

                          <div className="deposit-actions">

                            <button
                              type="button"
                              className="approve-btn"
                              disabled={
                                isProcessing
                              }
                              onClick={() =>
                                handleApprove(
                                  deposit
                                )
                              }
                            >
                              {isProcessing
                                ? "..."
                                : "Approve"}
                            </button>

                            <button
                              type="button"
                              className="reject-btn"
                              disabled={
                                isProcessing
                              }
                              onClick={() =>
                                openRejectModal(
                                  deposit
                                )
                              }
                            >
                              Reject
                            </button>

                          </div>

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


      {/* ==============================================
          REJECTION MODAL
      ============================================== */}

      {rejectModal.open && (
        <div
          className="reject-modal-overlay"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeRejectModal();
            }
          }}
        >

          <div className="reject-modal">

            <div className="reject-modal-header">

              <div className="reject-warning-icon">
                !
              </div>

              <div>
                <h2>
                  Reject Deposit
                </h2>

                <p>
                  Enter a reason for rejecting
                  this deposit request.
                </p>
              </div>

              <button
                type="button"
                className="close-modal-btn"
                onClick={
                  closeRejectModal
                }
              >
                ×
              </button>

            </div>


            <div className="reject-modal-body">

              {rejectModal.deposit && (
                <div className="reject-deposit-preview">

                  <div>
                    <span>
                      User
                    </span>

                    <strong>
                      {rejectModal.deposit
                        .user
                        ?.fullName ||
                        "Unknown User"}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Net Amount
                    </span>

                    <strong>
                      {formatUsd(
                        rejectModal.deposit
                          .netUsd
                      )}
                    </strong>
                  </div>

                </div>
              )}


              <label>
                Rejection Reason
              </label>

              <textarea
                value={
                  rejectionReason
                }
                onChange={(event) =>
                  setRejectionReason(
                    event.target.value
                  )
                }
                placeholder="Example: Transaction could not be verified."
                rows={5}
              />

            </div>


            <div className="reject-modal-footer">

              <button
                type="button"
                className="cancel-reject-btn"
                onClick={
                  closeRejectModal
                }
                disabled={
                  processingId !== null
                }
              >
                Cancel
              </button>

              <button
                type="button"
                className="confirm-reject-btn"
                onClick={
                  handleReject
                }
                disabled={
                  processingId !== null ||
                  !rejectionReason.trim()
                }
              >
                {processingId
                  ? "Rejecting..."
                  : "Confirm Reject"}
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}

export default AdminDeposits;