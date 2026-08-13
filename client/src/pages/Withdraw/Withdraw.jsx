import React, {
  useMemo,
  useState,
} from "react";

import "./Withdraw.css";

// ============================================================
// CONSTANTS
// ============================================================

const API_URL =
  "https://work-up-home.onrender.com/api";

const EXCHANGE_RATE = 115;

const FEE_PERCENT = 7;

const MIN_USD = 2;

const MAX_USD = 100;

const MIN_BDT =
  MIN_USD * EXCHANGE_RATE;

const MAX_BDT =
  MAX_USD * EXCHANGE_RATE;


// ============================================================
// PAYMENT METHODS
// ============================================================

const PAYMENT_METHODS = [
  {
    id: "nagad",
    name: "Nagad",
    subtitle: "Mobile Banking",
    icon: "N",
  },

  {
    id: "bkash",
    name: "bKash",
    subtitle: "Mobile Banking",
    icon: "B",
  },

  {
    id: "binance",
    name: "Binance",
    subtitle: "Crypto Wallet",
    icon: "B",
  },
];


// ============================================================
// COMPONENT
// ============================================================

function Withdraw() {
  const [
    method,
    setMethod,
  ] = useState("nagad");


  const [
    accountNumber,
    setAccountNumber,
  ] = useState("");


  const [
    withdrawAmount,
    setWithdrawAmount,
  ] = useState("");


  const [
    loading,
    setLoading,
  ] = useState(false);


  const [
    message,
    setMessage,
  ] = useState("");


  const [
    error,
    setError,
  ] = useState("");


  // ==========================================================
  // METHOD LABEL
  // ==========================================================

  const methodLabel =
    method === "nagad"
      ? "Nagad"
      : method === "bkash"
      ? "bKash"
      : "Binance";


  // ==========================================================
  // CALCULATION
  // ==========================================================

  const calculation = useMemo(() => {
    const amount =
      Number(withdrawAmount) || 0;


    if (amount <= 0) {
      return {
        amount: 0,
        fee: 0,
        receive: 0,
        bdt: 0,
        feeBdt: 0,
        receiveBdt: 0,
      };
    }


    const fee =
      amount *
      (FEE_PERCENT / 100);


    const receive =
      amount - fee;


    const bdt =
      amount *
      EXCHANGE_RATE;


    const feeBdt =
      fee *
      EXCHANGE_RATE;


    const receiveBdt =
      receive *
      EXCHANGE_RATE;


    return {
      amount,
      fee,
      receive,
      bdt,
      feeBdt,
      receiveBdt,
    };
  }, [
    withdrawAmount,
  ]);


  // ==========================================================
  // ACCOUNT LABEL
  // ==========================================================

  const accountLabel =
    method === "binance"
      ? "Binance Wallet Address"
      : `${methodLabel} Number`;


  // ==========================================================
  // ACCOUNT PLACEHOLDER
  // ==========================================================

  const accountPlaceholder =
    method === "binance"
      ? "Enter your Binance wallet address"
      : `Enter your ${methodLabel} number`;


  // ==========================================================
  // CHANGE PAYMENT METHOD
  // ==========================================================

  const handleMethodChange =
    (selectedMethod) => {
      setMethod(
        selectedMethod
      );

      setAccountNumber("");

      setMessage("");

      setError("");
    };


  // ==========================================================
  // AMOUNT CHANGE
  // ==========================================================

  const handleAmountChange =
    (event) => {
      const value =
        event.target.value;


      setMessage("");

      setError("");


      if (value === "") {
        setWithdrawAmount("");

        return;
      }


      const number =
        Number(value);


      if (
        Number.isNaN(number)
      ) {
        return;
      }


      setWithdrawAmount(
        value
      );
    };


  // ==========================================================
  // SUBMIT
  // ==========================================================

  const handleSubmit =
    async (event) => {
      event.preventDefault();


      setMessage("");

      setError("");


      const amount =
        Number(withdrawAmount);


      // ------------------------------------------------------
      // AMOUNT VALIDATION
      // ------------------------------------------------------

      if (
        !amount ||
        amount <= 0
      ) {
        setError(
          "Please enter a valid USDT amount."
        );

        return;
      }


      if (
        amount < MIN_USD
      ) {
        setError(
          `Minimum withdrawal is $${MIN_USD.toFixed(
            2
          )} USDT (৳${MIN_BDT.toLocaleString()}).`
        );

        return;
      }


      if (
        amount > MAX_USD
      ) {
        setError(
          `Maximum withdrawal is $${MAX_USD.toFixed(
            2
          )} USDT (৳${MAX_BDT.toLocaleString()}).`
        );

        return;
      }


      // ------------------------------------------------------
      // ACCOUNT VALIDATION
      // ------------------------------------------------------

      const cleanAccount =
        accountNumber.trim();


      if (!cleanAccount) {
        setError(
          `Please enter your ${methodLabel} ${
            method === "binance"
              ? "wallet address"
              : "number"
          }.`
        );

        return;
      }


      // ------------------------------------------------------
      // TOKEN
      // ------------------------------------------------------

      const token =
        localStorage.getItem(
          "token"
        ) ||
        localStorage.getItem(
          "accessToken"
        ) ||
        localStorage.getItem(
          "authToken"
        );


      if (!token) {
        setError(
          "You are not logged in. Please login first."
        );

        return;
      }


      // ------------------------------------------------------
      // REQUEST DATA
      // ------------------------------------------------------
      //
      // IMPORTANT:
      // Backend expects:
      //
      // method
      // account
      // amount
      //
      // NOT accountNumber.
      //
      // ------------------------------------------------------

      const payload = {
        method:
          method,

        account:
          cleanAccount,

        amount:
          amount,
      };


      // ------------------------------------------------------
      // SUBMIT REQUEST
      // ------------------------------------------------------

      try {
        setLoading(true);


        const response =
          await fetch(
            `${API_URL}/withdrawals`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${token}`,
              },

              body:
                JSON.stringify(
                  payload
                ),
            }
          );


        const data =
          await response
            .json()
            .catch(
              () => ({})
            );


        if (
          !response.ok
        ) {
          throw new Error(
            data.message ||
              "Withdrawal request failed."
          );
        }


        // ----------------------------------------------------
        // SUCCESS
        // ----------------------------------------------------

        setMessage(
          data.message ||
            "Withdrawal request submitted successfully. Admin will review your request."
        );


        setAccountNumber("");

        setWithdrawAmount("");


      } catch (
        submitError
      ) {
        console.error(
          "Withdraw submit error:",
          submitError
        );


        setError(
          submitError.message ||
            "Something went wrong while submitting your withdrawal request."
        );


      } finally {
        setLoading(false);
      }
    };


  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="withdraw-page">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="withdraw-header">

        <div>

          <span className="withdraw-kicker">
            WORK UP HOME
          </span>


          <h1>
            Withdraw Funds
          </h1>


          <p>
            Withdraw your available balance
            using your preferred payment method.
          </p>

        </div>


        {/* ===================================================
            WITHDRAW RANGE
        =================================================== */}

        <div className="withdraw-range-card">

          <span>
            Withdraw Range
          </span>


          <strong>
            ৳200 - ৳10,000
          </strong>


          <small>
            $2.00 - $100 USDT
          </small>

        </div>

      </div>


      {/* =====================================================
          MAIN CARD
      ===================================================== */}

      <div className="withdraw-card">


        {/* ===================================================
            PAYMENT METHODS
        =================================================== */}

        <div className="withdraw-methods">

          {PAYMENT_METHODS.map(
            (payment) => (

              <button
                key={
                  payment.id
                }

                type="button"

                className={`withdraw-method ${
                  method ===
                  payment.id
                    ? "active"
                    : ""
                }`}

                onClick={() =>
                  handleMethodChange(
                    payment.id
                  )
                }
              >

                <span className="withdraw-method-icon">
                  {payment.icon}
                </span>


                <span className="withdraw-method-content">

                  <strong>
                    {payment.name}
                  </strong>


                  <small>
                    {payment.subtitle}
                  </small>

                </span>

              </button>

            )
          )}

        </div>


        {/* ===================================================
            FORM
        =================================================== */}

        <form
          onSubmit={
            handleSubmit
          }

          className="withdraw-form"
        >


          {/* =================================================
              ACCOUNT NUMBER
          ================================================= */}

          <div className="withdraw-field">

            <label
              htmlFor="accountNumber"
            >
              {accountLabel}
            </label>


            <input
              id="accountNumber"

              type="text"

              value={
                accountNumber
              }

              onChange={(event) =>
                setAccountNumber(
                  event.target.value
                )
              }

              placeholder={
                accountPlaceholder
              }

              autoComplete="off"
            />


            <small>
              Enter the account where you want
              to receive your withdrawal.
            </small>

          </div>


          {/* =================================================
              WITHDRAW AMOUNT
          ================================================= */}

          <div className="withdraw-field">

            <label
              htmlFor="withdrawAmount"
            >
              Withdraw Amount
            </label>


            <div className="withdraw-amount-input">

              <span>
                $
              </span>


              <input
                id="withdrawAmount"

                type="number"

                min={
                  MIN_USD
                }

                max={
                  MAX_USD
                }

                step="0.01"

                value={
                  withdrawAmount
                }

                onChange={
                  handleAmountChange
                }

                placeholder="Enter USDT amount"
              />


              <strong>
                USDT
              </strong>

            </div>


            <small>
              Minimum $2.00 • Maximum $100 USDT
            </small>


            <small className="bdt-range-text">
              ৳230 • ৳11,500
            </small>

          </div>


          {/* =================================================
              CALCULATION
          ================================================= */}

          <div className="withdraw-calculation">


            {/* WITHDRAW AMOUNT */}

            <div className="calculation-row">

              <span>
                Withdraw Amount
              </span>


              <strong>
                $
                {calculation.amount.toFixed(
                  2
                )}
              </strong>

            </div>


            {/* BDT VALUE */}

            <div className="calculation-row">

              <span>
                BDT Value
              </span>


              <strong>
                ৳
                {calculation.bdt.toLocaleString(
                  "en-BD",
                  {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }
                )}
              </strong>

            </div>


            {/* FEE */}

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


            {/* RECEIVE */}

            <div className="calculation-row total">

              <span>
                You Receive
              </span>


              <strong>
                $
                {calculation.receive.toFixed(
                  2
                )}
              </strong>

            </div>


          </div>


          {/* =================================================
              ERROR
          ================================================= */}

          {error && (

            <div className="withdraw-message error">
              {error}
            </div>

          )}


          {/* =================================================
              SUCCESS
          ================================================= */}

          {message && (

            <div className="withdraw-message success">
              {message}
            </div>

          )}


          {/* =================================================
              SUBMIT
          ================================================= */}

          <button
            type="submit"

            className="withdraw-submit"

            disabled={
              loading
            }
          >

            {loading
              ? "Submitting..."
              : "Submit Withdraw Request"}

          </button>


        </form>


        {/* ===================================================
            FEE NOTICE
        =================================================== */}

        <div className="withdraw-fee-notice">

          <strong>
            7% Processing Fee
          </strong>


          <p>
            A 7% processing fee is deducted
            from every withdrawal request.
          </p>

        </div>


      </div>

    </div>
  );
}


export default Withdraw;