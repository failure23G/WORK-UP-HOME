import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import "./AdminManageBalances.css";


const API_BASE =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";


const getToken = () => {
  return (
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("authToken") ||
    ""
  );
};


const getUserId = (user) => {
  return (
    user?._id ||
    user?.id ||
    user?.userId ||
    ""
  );
};


const getUserName = (user) => {
  return (
    user?.fullName ||
    user?.name ||
    user?.username ||
    user?.userId ||
    "Unknown User"
  );
};


const getUserEmail = (user) => {
  return (
    user?.email ||
    ""
  );
};


const money = (value) => {
  const number =
    Number(value || 0);

  if (
    !Number.isFinite(number)
  ) {
    return "0.00";
  }

  return number.toFixed(2);
};


export default function AdminManageBalances() {

  const [users, setUsers] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [selectedUserId, setSelectedUserId] =
    useState("");

  const [balanceType, setBalanceType] =
    useState("wallet");

  const [action, setAction] =
    useState("add");

  const [amount, setAmount] =
    useState("");

  const [note, setNote] =
    useState("");


  const selectedUser =
    useMemo(() => {

      if (!selectedUserId) {
        return null;
      }

      return (
        users.find(
          (user) =>
            String(
              getUserId(user)
            ) ===
            String(
              selectedUserId
            )
        ) || null
      );

    }, [
      users,
      selectedUserId,
    ]);


  const filteredUsers =
    useMemo(() => {

      const keyword =
        search
          .trim()
          .toLowerCase();

      if (!keyword) {
        return users;
      }

      return users.filter(
        (user) => {

          const id =
            String(
              user?.userId ||
              user?._id ||
              ""
            ).toLowerCase();

          const name =
            String(
              getUserName(user)
            ).toLowerCase();

          const email =
            String(
              getUserEmail(user)
            ).toLowerCase();

          return (
            id.includes(
              keyword
            ) ||
            name.includes(
              keyword
            ) ||
            email.includes(
              keyword
            )
          );
        }
      );

    }, [
      users,
      search,
    ]);


  const loadUsers =
    async () => {

      try {

        setLoading(true);
        setError("");
        setSuccess("");

        const token =
          getToken();

        if (!token) {
          throw new Error(
            "Admin authentication token not found."
          );
        }

        const response =
          await fetch(
            `${API_BASE}/api/admin/users`,
            {
              method:
                "GET",

              headers: {
                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        const data =
          await response
            .json()
            .catch(
              () => ({})
            );

        if (
          !response.ok ||
          data.success === false
        ) {
          throw new Error(
            data.message ||
            "Failed to load users."
          );
        }

        const userList =
          Array.isArray(
            data.users
          )
            ? data.users
            : Array.isArray(
                data.data
              )
            ? data.data
            : [];

        setUsers(
          userList
        );

      } catch (err) {

        console.error(
          "Load admin users error:",
          err
        );

        setError(
          err.message ||
          "Failed to load users."
        );

      } finally {

        setLoading(false);
      }
    };


  useEffect(() => {
    loadUsers();
  }, []);


  const handleSelectUser =
    (event) => {

      setSelectedUserId(
        event.target.value
      );

      setError("");
      setSuccess("");
    };


  const handleAmountChange =
    (event) => {

      const value =
        event.target.value;

      if (
        value === "" ||
        /^\d*\.?\d{0,2}$/.test(
          value
        )
      ) {
        setAmount(value);
      }
    };


  const handleSubmit =
    async (event) => {

      event.preventDefault();

      setError("");
      setSuccess("");


      if (!selectedUser) {
        setError(
          "Please select a user."
        );

        return;
      }


      const numericAmount =
        Number(amount);


      if (
        !Number.isFinite(
          numericAmount
        ) ||
        numericAmount <= 0
      ) {
        setError(
          "Please enter a valid amount greater than 0."
        );

        return;
      }


      const userId =
        getUserId(
          selectedUser
        );


      if (!userId) {
        setError(
          "Selected user ID was not found."
        );

        return;
      }


      const confirmText =
        action === "add"
          ? `Add $${money(
              numericAmount
            )} to ${balanceType}?`
          : `Deduct $${money(
              numericAmount
            )} from ${balanceType}?`;


      const confirmed =
        window.confirm(
          confirmText
        );


      if (!confirmed) {
        return;
      }


      try {

        setSaving(true);

        const token =
          getToken();

        if (!token) {
          throw new Error(
            "Admin authentication token not found."
          );
        }


        const response =
          await fetch(
            `${API_BASE}/api/admin/users/${userId}/manage-balance`,
            {
              method:
                "POST",

              headers: {
                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${token}`,
              },

              body:
                JSON.stringify({
                  balanceType,
                  action,
                  amount:
                    numericAmount,
                  note:
                    note.trim(),
                }),
            }
          );


        const data =
          await response
            .json()
            .catch(
              () => ({})
            );


        if (
          !response.ok ||
          data.success === false
        ) {
          throw new Error(
            data.message ||
            "Balance update failed."
          );
        }


        const updatedUser =
          data.user ||
          null;


        setUsers(
          (currentUsers) =>
            currentUsers.map(
              (user) => {

                if (
                  String(
                    getUserId(user)
                  ) !==
                  String(
                    userId
                  )
                ) {
                  return user;
                }


                if (
                  !updatedUser
                ) {
                  return user;
                }


                return {
                  ...user,

                  wallet:
                    updatedUser.wallet,

                  deposit:
                    updatedUser.deposit,

                  earning:
                    updatedUser.earning,
                };
              }
            )
        );


        setSuccess(
          data.message ||
          "Balance updated successfully."
        );


        setAmount("");
        setNote("");


      } catch (err) {

        console.error(
          "Manage balance error:",
          err
        );

        setError(
          err.message ||
          "Failed to update balance."
        );

      } finally {

        setSaving(false);
      }
    };


  const refreshUsers =
    async () => {

      await loadUsers();

      setSuccess(
        "User balances refreshed."
      );
    };


  return (
    <div className="admin-manage-balances">

      <div className="amb-header">

        <div>
          <h1>
            Manage User Balances
          </h1>

          <p>
            Manually add or deduct
            Wallet, Deposit, or
            Earning balance.
          </p>
        </div>


        <button
          type="button"
          className="amb-refresh-button"
          onClick={
            refreshUsers
          }
          disabled={
            loading ||
            saving
          }
        >
          {loading
            ? "Loading..."
            : "Refresh Users"}
        </button>

      </div>


      {error && (
        <div className="amb-alert amb-error">
          {error}
        </div>
      )}


      {success && (
        <div className="amb-alert amb-success">
          {success}
        </div>
      )}


      <div className="amb-grid">

        <section className="amb-card">

          <div className="amb-card-header">

            <h2>
              Select User
            </h2>

            <span>
              {users.length} users
            </span>

          </div>


          <div className="amb-search">

            <input
              type="text"
              placeholder="Search by name, email or User ID..."
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
            />

          </div>


          <div className="amb-user-select">

            <label>
              User
            </label>

            <select
              value={
                selectedUserId
              }
              onChange={
                handleSelectUser
              }
              disabled={
                loading ||
                saving
              }
            >

              <option value="">
                Select a user
              </option>

              {filteredUsers.map(
                (user) => {

                  const id =
                    getUserId(
                      user
                    );

                  return (
                    <option
                      key={id}
                      value={id}
                    >
                      {getUserName(
                        user
                      )}
                      {" — "}
                      {getUserEmail(
                        user
                      )}
                    </option>
                  );
                }
              )}

            </select>

          </div>


          {selectedUser && (
            <div className="amb-selected-user">

              <div className="amb-user-avatar">
                {getUserName(
                  selectedUser
                )
                  .charAt(0)
                  .toUpperCase()}
              </div>


              <div className="amb-user-info">

                <strong>
                  {getUserName(
                    selectedUser
                  )}
                </strong>

                <span>
                  {getUserEmail(
                    selectedUser
                  )}
                </span>

                <small>
                  ID:{" "}
                  {selectedUser.userId ||
                    selectedUser._id}
                </small>

              </div>

            </div>
          )}

        </section>


        <section className="amb-card">

          <div className="amb-card-header">

            <h2>
              Current Balance
            </h2>

          </div>


          {selectedUser ? (

            <div className="amb-balances">

              <div className="amb-balance-box">

                <span>
                  Wallet
                </span>

                <strong>
                  $
                  {money(
                    selectedUser.wallet
                  )}
                </strong>

              </div>


              <div className="amb-balance-box">

                <span>
                  Deposit
                </span>

                <strong>
                  $
                  {money(
                    selectedUser.deposit
                  )}
                </strong>

              </div>


              <div className="amb-balance-box">

                <span>
                  Earning
                </span>

                <strong>
                  $
                  {money(
                    selectedUser.earning
                  )}
                </strong>

              </div>

            </div>

          ) : (

            <div className="amb-empty">

              Select a user to
              view balance.

            </div>

          )}

        </section>

      </div>


      <section className="amb-card amb-action-card">

        <div className="amb-card-header">

          <div>

            <h2>
              Manage Balance
            </h2>

            <p>
              Update the selected
              user's balance.
            </p>

          </div>

        </div>


        <form
          onSubmit={
            handleSubmit
          }
          className="amb-form"
        >

          <div className="amb-form-grid">

            <div className="amb-field">

              <label>
                Balance Type
              </label>

              <select
                value={
                  balanceType
                }
                onChange={(event) =>
                  setBalanceType(
                    event.target.value
                  )
                }
                disabled={
                  saving
                }
              >

                <option value="wallet">
                  Wallet
                </option>

                <option value="deposit">
                  Deposit
                </option>

                <option value="earning">
                  Earning
                </option>

              </select>

            </div>


            <div className="amb-field">

              <label>
                Action
              </label>

              <select
                value={
                  action
                }
                onChange={(event) =>
                  setAction(
                    event.target.value
                  )
                }
                disabled={
                  saving
                }
              >

                <option value="add">
                  Add Balance
                </option>

                <option value="deduct">
                  Deduct Balance
                </option>

              </select>

            </div>


            <div className="amb-field">

              <label>
                Amount
              </label>

              <div className="amb-amount-input">

                <span>
                  $
                </span>

                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="0.00"
                  value={
                    amount
                  }
                  onChange={
                    handleAmountChange
                  }
                  disabled={
                    saving
                  }
                />

              </div>

            </div>


            <div className="amb-field amb-note-field">

              <label>
                Note
                <span>
                  Optional
                </span>
              </label>

              <input
                type="text"
                placeholder="Example: Manual balance adjustment"
                value={
                  note
                }
                onChange={(event) =>
                  setNote(
                    event.target.value
                  )
                }
                disabled={
                  saving
                }
              />

            </div>

          </div>


          <div className="amb-preview">

            <div>

              <span>
                Selected User
              </span>

              <strong>
                {selectedUser
                  ? getUserName(
                      selectedUser
                    )
                  : "No user selected"}
              </strong>

            </div>


            <div>

              <span>
                Operation
              </span>

              <strong
                className={
                  action ===
                  "add"
                    ? "amb-add-text"
                    : "amb-deduct-text"
                }
              >
                {action ===
                "add"
                  ? "+"
                  : "-"}
                $
                {money(
                  amount
                )}
                {" "}
                {balanceType}
              </strong>

            </div>

          </div>


          <button
            type="submit"
            className={
              action ===
              "add"
                ? "amb-submit amb-submit-add"
                : "amb-submit amb-submit-deduct"
            }
            disabled={
              saving ||
              loading ||
              !selectedUserId ||
              !amount
            }
          >

            {saving
              ? "Updating Balance..."
              : action ===
                "add"
              ? "Add Balance"
              : "Deduct Balance"}

          </button>

        </form>

      </section>

    </div>
  );
}