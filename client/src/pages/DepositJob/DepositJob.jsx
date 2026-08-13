import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import "./DepositJob.css";

const API_URL =
  "http://localhost:5000/api";

const SERVER_URL =
  "http://localhost:5000";

const EXCHANGE_RATE = 115;

const FEE_PERCENT = 7;

const PAYMENT_ACCOUNTS = {
  bkash: "01618594848",
  nagad: "01616944570",
};

function DepositJob() {
  const [method, setMethod] =
    useState("bkash");

  const [bdtAmount, setBdtAmount] =
    useState("");

  const [transactionId, setTransactionId] =
    useState("");

  const [paymentScreenshot, setPaymentScreenshot] =
    useState(null);

  const [screenshotPreview, setScreenshotPreview] =
    useState("");

  const [copied, setCopied] =
    useState(false);

  const [deposits, setDeposits] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  const [historyLoading, setHistoryLoading] =
    useState(true);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  // =====================================================
  // TOKEN
  // =====================================================

  const getToken = () => {
    return (
      localStorage.getItem("token") ||
      localStorage.getItem("accessToken") ||
      localStorage.getItem("authToken")
    );
  };

  // =====================================================
  // CALCULATION
  // =====================================================

  const calculation = useMemo(() => {
    const bdt =
      Number(bdtAmount);

    if (
      !bdt ||
      bdt <= 0
    ) {
      return {
        usd: 0,
        fee: 0,
        net: 0,
      };
    }

    const usd =
      bdt / EXCHANGE_RATE;

    const fee =
      usd *
      (FEE_PERCENT / 100);

    const net =
      usd - fee;

    return {
      usd,
      fee,
      net,
    };
  }, [bdtAmount]);

  // =====================================================
  // PAYMENT ACCOUNT
  // =====================================================

  const paymentNumber =
    PAYMENT_ACCOUNTS[method] ||
    "";

  // =====================================================
  // FETCH HISTORY
  // =====================================================

  const fetchDeposits =
    async () => {
      try {
        setHistoryLoading(true);

        const token =
          getToken();

        if (!token) {
          setHistoryLoading(false);
          return;
        }

        const response =
          await fetch(
            `${API_URL}/deposits/my`,
            {
              method: "GET",

              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Failed to load deposits."
          );
        }

        setDeposits(
          data.deposits ||
            []
        );
      } catch (err) {
        console.error(
          "Deposit history error:",
          err
        );
      } finally {
        setHistoryLoading(
          false
        );
      }
    };

  // =====================================================
  // LOAD HISTORY
  // =====================================================

  useEffect(() => {
    fetchDeposits();
  }, []);

  // =====================================================
  // CHANGE METHOD
  // =====================================================

  const handleMethodChange =
    (selectedMethod) => {
      setMethod(
        selectedMethod
      );

      setMessage("");
      setError("");
      setCopied(false);
    };

  // =====================================================
  // COPY PAYMENT NUMBER
  // =====================================================

  const copyPaymentNumber =
    async () => {
      if (!paymentNumber) {
        return;
      }

      try {
        await navigator.clipboard.writeText(
          paymentNumber
        );

        setCopied(true);

        setTimeout(() => {
          setCopied(false);
        }, 2000);
      } catch (err) {
        console.error(
          "Copy error:",
          err
        );
      }
    };

  // =====================================================
  // SCREENSHOT CHANGE
  // =====================================================

  const handleScreenshotChange =
    (e) => {
      const file =
        e.target.files?.[0];

      setError("");
      setMessage("");

      if (!file) {
        setPaymentScreenshot(
          null
        );

        setScreenshotPreview(
          ""
        );

        return;
      }

      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
      ];

      if (
        !allowedTypes.includes(
          file.type
        )
      ) {
        setError(
          "Only JPG, JPEG, PNG and WEBP screenshots are allowed."
        );

        e.target.value = "";

        return;
      }

      if (
        file.size >
        5 * 1024 * 1024
      ) {
        setError(
          "Screenshot must be 5MB or less."
        );

        e.target.value = "";

        return;
      }

      setPaymentScreenshot(
        file
      );

      const previewUrl =
        URL.createObjectURL(
          file
        );

      setScreenshotPreview(
        previewUrl
      );
    };

  // =====================================================
  // SUBMIT
  // =====================================================

  const handleSubmit =
    async (e) => {
      e.preventDefault();

      setMessage("");
      setError("");

      // Binance disabled
      if (
        method === "binance"
      ) {
        setError(
          "Binance deposit is coming soon."
        );

        return;
      }

      const amount =
        Number(bdtAmount);

      // Amount
      if (
        !amount ||
        amount <= 0
      ) {
        setError(
          "Please enter a valid deposit amount."
        );

        return;
      }

      if (
        amount <
        EXCHANGE_RATE
      ) {
        setError(
          `Minimum deposit is ${EXCHANGE_RATE} BDT.`
        );

        return;
      }

      // Transaction
      if (
        !transactionId.trim()
      ) {
        setError(
          "Please enter your transaction ID."
        );

        return;
      }

      // Screenshot
      if (
        !paymentScreenshot
      ) {
        setError(
          "Please upload your payment screenshot."
        );

        return;
      }

      // Token
      const token =
        getToken();

      if (!token) {
        setError(
          "You are not logged in. Please login first."
        );

        return;
      }

      try {
        setLoading(true);

        const formData =
          new FormData();

        formData.append(
          "method",
          method
        );

        formData.append(
          "bdtAmount",
          amount
        );

        formData.append(
          "transactionId",
          transactionId.trim()
        );

        formData.append(
          "paymentScreenshot",
          paymentScreenshot
        );

        const response =
          await fetch(
            `${API_URL}/deposits`,
            {
              method: "POST",

              headers: {
                Authorization:
                  `Bearer ${token}`,
              },

              body: formData,
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Deposit request failed."
          );
        }

        setMessage(
          "Deposit request submitted successfully. Admin will review your payment."
        );

        setBdtAmount("");

        setTransactionId("");

        setPaymentScreenshot(
          null
        );

        setScreenshotPreview(
          ""
        );

        const fileInput =
          document.getElementById(
            "paymentScreenshot"
          );

        if (fileInput) {
          fileInput.value = "";
        }

        await fetchDeposits();
      } catch (err) {
        console.error(
          "Deposit submit error:",
          err
        );

        setError(
          err.message ||
            "Something went wrong while submitting deposit."
        );
      } finally {
        setLoading(false);
      }
    };

  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate =
    (date) => {
      if (!date) {
        return "-";
      }

      return new Date(
        date
      ).toLocaleString(
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

  // =====================================================
  // STATUS
  // =====================================================

  const getStatusClass =
    (status) => {
      if (
        status ===
        "approved"
      ) {
        return "deposit-status approved";
      }

      if (
        status ===
        "rejected"
      ) {
        return "deposit-status rejected";
      }

      return "deposit-status pending";
    };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="deposit-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="deposit-header">
        <div>
          <span className="deposit-kicker">
            WORK UP HOME
          </span>

          <h1>
            Deposit Funds
          </h1>

          <p>
            Add money to your Work Up Home
            balance using your preferred
            payment method.
          </p>
        </div>

        <div className="exchange-card">
          <span>
            Exchange Rate
          </span>

          <strong>
            $1 = ৳{EXCHANGE_RATE}
          </strong>
        </div>
      </div>


      {/* =================================================
          ALERTS
      ================================================= */}

      {message && (
        <div className="deposit-alert success">
          <span>✓</span>

          <div>
            {message}
          </div>
        </div>
      )}

      {error && (
        <div className="deposit-alert error">
          <span>!</span>

          <div>
            {error}
          </div>
        </div>
      )}


      {/* =================================================
          MAIN
      ================================================= */}

      <div className="deposit-layout">

        {/* =================================================
            FORM
        ================================================= */}

        <div className="deposit-card">

          <div className="card-title">

            <div className="card-icon">
              $
            </div>

            <div>
              <h2>
                Make a Deposit
              </h2>

              <p>
                Select a payment method,
                send payment and upload
                your payment proof.
              </p>
            </div>

          </div>


          <form
            onSubmit={
              handleSubmit
            }
          >

            {/* =================================================
                PAYMENT METHODS
            ================================================= */}

            <div className="form-section">

              <label className="form-label">
                Payment Method
              </label>

              <div className="payment-methods">

                {/* BKASH */}

                <button
                  type="button"
                  className={
                    method === "bkash"
                      ? "payment-method active bkash"
                      : "payment-method bkash"
                  }
                  onClick={() =>
                    handleMethodChange(
                      "bkash"
                    )
                  }
                >
                  <span className="method-logo">
                    B
                  </span>

                  <span>
                    <strong>
                      bKash
                    </strong>

                    <small>
                      Mobile Banking
                    </small>
                  </span>
                </button>


                {/* NAGAD */}

                <button
                  type="button"
                  className={
                    method === "nagad"
                      ? "payment-method active nagad"
                      : "payment-method nagad"
                  }
                  onClick={() =>
                    handleMethodChange(
                      "nagad"
                    )
                  }
                >
                  <span className="method-logo">
                    N
                  </span>

                  <span>
                    <strong>
                      Nagad
                    </strong>

                    <small>
                      Mobile Banking
                    </small>
                  </span>
                </button>


                {/* BINANCE */}

                <button
                  type="button"
                  className="payment-method binance"
                  onClick={() =>
                    handleMethodChange(
                      "binance"
                    )
                  }
                >
                  <span className="method-logo">
                    B
                  </span>

                  <span>
                    <strong>
                      Binance
                    </strong>

                    <small>
                      Coming Soon
                    </small>
                  </span>
                </button>

              </div>
            </div>


            {/* =================================================
                PAYMENT NUMBER
            ================================================= */}

            {method !== "binance" ? (
              <div className="payment-account-box">

                <div>
                  <span className="account-label">
                    Send Money To
                  </span>

                  <strong className="account-number">
                    {paymentNumber}
                  </strong>
                </div>

                <button
                  type="button"
                  className="copy-button"
                  onClick={
                    copyPaymentNumber
                  }
                >
                  {copied
                    ? "Copied ✓"
                    : "Copy"}
                </button>

              </div>
            ) : (
              <div className="binance-coming-box">
                <span className="coming-icon">
                  ◈
                </span>

                <div>
                  <strong>
                    Binance Coming Soon
                  </strong>

                  <p>
                    Binance deposits are
                    temporarily unavailable.
                  </p>
                </div>
              </div>
            )}


            {/* =================================================
                AMOUNT
            ================================================= */}

            {method !== "binance" && (
              <>
                <div className="form-section">

                  <label
                    htmlFor="bdtAmount"
                    className="form-label"
                  >
                    Deposit Amount
                  </label>

                  <div className="amount-input">

                    <span>
                      ৳
                    </span>

                    <input
                      id="bdtAmount"
                      type="number"
                      min="115"
                      step="1"
                      placeholder="Enter BDT amount"
                      value={
                        bdtAmount
                      }
                      onChange={(e) =>
                        setBdtAmount(
                          e.target.value
                        )
                      }
                    />

                    <span className="currency">
                      BDT
                    </span>

                  </div>

                  <small className="input-help">
                    Minimum deposit:
                    ৳115
                  </small>

                </div>


                {/* =================================================
                    TRANSACTION ID
                ================================================= */}

                <div className="form-section">

                  <label
                    htmlFor="transactionId"
                    className="form-label"
                  >
                    Transaction ID
                  </label>

                  <input
                    id="transactionId"
                    type="text"
                    className="text-input"
                    placeholder="Enter your transaction ID"
                    value={
                      transactionId
                    }
                    onChange={(e) =>
                      setTransactionId(
                        e.target.value
                      )
                    }
                  />

                  <small className="input-help">
                    Enter the transaction/reference
                    ID from your payment.
                  </small>

                </div>


                {/* =================================================
                    SCREENSHOT
                ================================================= */}

                <div className="form-section">

                  <label
                    htmlFor="paymentScreenshot"
                    className="form-label"
                  >
                    Payment Screenshot
                    <span className="required-star">
                      *
                    </span>
                  </label>

                  <label
                    htmlFor="paymentScreenshot"
                    className="screenshot-upload"
                  >
                    <span className="upload-icon">
                      📷
                    </span>

                    <span className="upload-text">
                      {paymentScreenshot
                        ? paymentScreenshot.name
                        : "Upload payment screenshot"}
                    </span>

                    <span className="upload-hint">
                      JPG, PNG or WEBP · Max 5MB
                    </span>
                  </label>

                  <input
                    id="paymentScreenshot"
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    className="hidden-file-input"
                    onChange={
                      handleScreenshotChange
                    }
                  />

                  {screenshotPreview && (
                    <div className="screenshot-preview-box">

                      <img
                        src={
                          screenshotPreview
                        }
                        alt="Payment screenshot preview"
                        className="screenshot-preview"
                      />

                      <button
                        type="button"
                        className="remove-screenshot"
                        onClick={() => {
                          setPaymentScreenshot(
                            null
                          );

                          setScreenshotPreview(
                            ""
                          );

                          const input =
                            document.getElementById(
                              "paymentScreenshot"
                            );

                          if (input) {
                            input.value = "";
                          }
                        }}
                      >
                        Remove
                      </button>

                    </div>
                  )}

                  <small className="input-help">
                    Upload a clear screenshot
                    showing your successful payment.
                  </small>

                </div>


                {/* =================================================
                    CALCULATION
                ================================================= */}

                <div className="calculation-box">

                  <div className="calculation-row">
                    <span>
                      Deposit
                    </span>

                    <strong>
                      $
                      {calculation.usd.toFixed(
                        2
                      )}
                    </strong>
                  </div>


                  <div className="calculation-row">

                    <span>
                      Processing Fee
                      <small>
                        {" "}
                        ({FEE_PERCENT}%)
                      </small>
                    </span>

                    <strong className="fee">
                      -$
                      {calculation.fee.toFixed(
                        2
                      )}
                    </strong>

                  </div>


                  <div className="calculation-line" />


                  <div className="calculation-row total">

                    <span>
                      You Receive
                    </span>

                    <strong>
                      $
                      {calculation.net.toFixed(
                        2
                      )}
                    </strong>

                  </div>

                </div>


                {/* =================================================
                    SUBMIT
                ================================================= */}

                <button
                  type="submit"
                  className="deposit-submit"
                  disabled={
                    loading
                  }
                >
                  {loading
                    ? "Submitting..."
                    : "Submit Deposit Request"}
                </button>

              </>
            )}

          </form>
        </div>


        {/* =================================================
            PAYMENT INFORMATION
        ================================================= */}

        <div className="payment-info-card">

          <div className="payment-info-header">

            <span className="info-icon">
              $
            </span>

            <div>
              <h2>
                Payment Information
              </h2>

              <p>
                Follow these steps carefully
                before submitting.
              </p>
            </div>

          </div>


          {method !== "binance" ? (
            <div className="selected-account">

              <span>
                {method === "bkash"
                  ? "bKash Number"
                  : "Nagad Number"}
              </span>

              <strong>
                {paymentNumber}
              </strong>

            </div>
          ) : (
            <div className="selected-account coming">

              <span>
                Binance
              </span>

              <strong>
                Coming Soon
              </strong>

            </div>
          )}


          <div className="payment-instructions">

            <h3>
              How it works
            </h3>


            <div className="instruction">
              <span>
                1
              </span>

              <p>
                Select bKash or Nagad.
              </p>
            </div>


            <div className="instruction">
              <span>
                2
              </span>

              <p>
                Send your BDT payment
                to the displayed number.
              </p>
            </div>


            <div className="instruction">
              <span>
                3
              </span>

              <p>
                Enter your transaction ID.
              </p>
            </div>


            <div className="instruction">
              <span>
                4
              </span>

              <p>
                Upload your payment
                screenshot.
              </p>
            </div>


            <div className="instruction">
              <span>
                5
              </span>

              <p>
                Submit and wait for
                admin approval.
              </p>
            </div>

          </div>


          <div className="fee-notice">

            <strong>
              7% Processing Fee
            </strong>

            <p>
              A 7% processing fee is deducted
              from every deposit.
            </p>

          </div>

        </div>

      </div>


      {/* =================================================
          HISTORY
      ================================================= */}

      <div className="history-card">

        <div className="history-header">

          <div>

            <span className="history-kicker">
              ACCOUNT ACTIVITY
            </span>

            <h2>
              Deposit History
            </h2>

            <p>
              Your previous deposit requests
              are shown below.
            </p>

          </div>

          <div className="history-count">
            {deposits.length}

            <span>
              Deposits
            </span>
          </div>

        </div>


        <div className="history-scroll">

          {historyLoading ? (
            <div className="history-empty">

              <div className="loading-spinner" />

              <p>
                Loading deposit history...
              </p>

            </div>
          ) : deposits.length === 0 ? (
            <div className="history-empty">

              <div className="empty-icon">
                $
              </div>

              <h3>
                No Deposits Yet
              </h3>

              <p>
                Your deposit history will appear
                here after you submit a request.
              </p>

            </div>
          ) : (
            <div className="history-list">

              {deposits.map(
                (deposit) => (
                  <div
                    className="history-item"
                    key={
                      deposit._id
                    }
                  >

                    <div className="history-method">

                      <div
                        className={`history-method-icon ${deposit.method}`}
                      >
                        {deposit.method ===
                        "bkash"
                          ? "B"
                          : deposit.method ===
                            "nagad"
                          ? "N"
                          : "B"}
                      </div>

                      <div>

                        <strong>
                          {deposit.method
                            .charAt(0)
                            .toUpperCase() +
                            deposit.method.slice(
                              1
                            )}
                        </strong>

                        <small>
                          {formatDate(
                            deposit.createdAt
                          )}
                        </small>

                      </div>

                    </div>


                    <div className="history-amount">

                      <strong>
                        ৳
                        {Number(
                          deposit.bdtAmount ||
                            0
                        ).toFixed(2)}
                      </strong>

                      <small>
                        $
                        {Number(
                          deposit.netUsd ||
                            0
                        ).toFixed(2)}
                      </small>

                    </div>


                    <div className="history-fee">

                      <span>
                        Fee
                      </span>

                      <strong>
                        $
                        {Number(
                          deposit.feeUsd ||
                            0
                        ).toFixed(2)}
                      </strong>

                    </div>


                    <div
                      className={getStatusClass(
                        deposit.status
                      )}
                    >
                      {deposit.status
                        ? deposit.status
                            .charAt(0)
                            .toUpperCase() +
                          deposit.status.slice(
                            1
                          )
                        : "Pending"}
                    </div>


                    {deposit.paymentScreenshot && (
                      <a
                        href={`${SERVER_URL}${deposit.paymentScreenshot}`}
                        target="_blank"
                        rel="noreferrer"
                        className="history-proof"
                      >
                        View Proof
                      </a>
                    )}

                  </div>
                )
              )}

            </div>
          )}

        </div>

      </div>

    </div>
  );
}

export default DepositJob;