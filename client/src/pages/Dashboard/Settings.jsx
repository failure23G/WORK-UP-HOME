import { useEffect, useState } from "react";
import { changePassword } from "../../services/authService";
import "./Settings.css";

const Settings = () => {
  // ========================================
  // NOTIFICATIONS
  // ========================================

  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    promotions: false,
  });

  // ========================================
  // THEME
  // ========================================

  const [theme, setTheme] = useState("light");

  // ========================================
  // SETTINGS MESSAGE
  // ========================================

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // ========================================
  // PASSWORD
  // ========================================

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [changingPassword, setChangingPassword] =
    useState(false);

  const [passwordMessage, setPasswordMessage] =
    useState("");

  const [passwordError, setPasswordError] =
    useState("");

  // ========================================
  // LOAD SAVED SETTINGS
  // ========================================

  useEffect(() => {
    try {
      const savedSettings =
        localStorage.getItem("settings");

      if (!savedSettings) {
        return;
      }

      const parsedSettings =
        JSON.parse(savedSettings);

      if (parsedSettings.notifications) {
        setNotifications(
          parsedSettings.notifications
        );
      }

      if (parsedSettings.theme) {
        setTheme(parsedSettings.theme);
      }
    } catch (err) {
      console.error(
        "Failed to load settings:",
        err
      );
    }
  }, []);

  // ========================================
  // NOTIFICATION CHANGE
  // ========================================

  const handleNotificationChange = (name) => {
    setNotifications((previous) => ({
      ...previous,
      [name]: !previous[name],
    }));

    setMessage("");
    setError("");
  };

  // ========================================
  // THEME CHANGE
  // ========================================

  const handleThemeChange = (event) => {
    setTheme(event.target.value);

    setMessage("");
    setError("");
  };

  // ========================================
  // SAVE SETTINGS
  // ========================================

  const handleSaveSettings = (event) => {
    event.preventDefault();

    try {
      localStorage.setItem(
        "settings",
        JSON.stringify({
          notifications,
          theme,
        })
      );

      setError("");
      setMessage("Settings saved successfully");
    } catch (err) {
      console.error(
        "Save settings error:",
        err
      );

      setMessage("");
      setError("Failed to save settings");
    }
  };

  // ========================================
  // PASSWORD INPUT
  // ========================================

  const handlePasswordChange = (event) => {
    const { name, value } = event.target;

    setPasswordData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setPasswordMessage("");
    setPasswordError("");
  };

  // ========================================
  // PASSWORD VISIBILITY
  // ========================================

  const togglePasswordVisibility = (field) => {
    setShowPassword((previous) => ({
      ...previous,
      [field]: !previous[field],
    }));
  };

  // ========================================
  // CHANGE PASSWORD
  // ========================================

  const handleChangePassword = async (event) => {
    event.preventDefault();

    setPasswordMessage("");
    setPasswordError("");

    const {
      currentPassword,
      newPassword,
      confirmPassword,
    } = passwordData;

    // Required fields
    if (
      !currentPassword ||
      !newPassword ||
      !confirmPassword
    ) {
      setPasswordError(
        "Please fill in all password fields"
      );

      return;
    }

    // Password length
    if (newPassword.length < 6) {
      setPasswordError(
        "New password must be at least 6 characters long"
      );

      return;
    }

    // Password match
    if (newPassword !== confirmPassword) {
      setPasswordError(
        "New passwords do not match"
      );

      return;
    }

    try {
      setChangingPassword(true);

      const data = await changePassword({
        currentPassword,
        newPassword,
        confirmPassword,
      });

      setPasswordMessage(
        data?.message ||
          "Password changed successfully"
      );

      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      console.error(
        "Change password error:",
        err
      );

      setPasswordError(
        err?.response?.data?.message ||
          "Failed to change password"
      );
    } finally {
      setChangingPassword(false);
    }
  };

  // ========================================
  // PAGE
  // ========================================

  return (
    <div className="settings-page">

      {/* ========================================
          HEADER
      ======================================== */}

      <div className="settings-header">
        <div>
          <h1>Settings</h1>

          <p>
            Manage your account preferences,
            security and notifications.
          </p>
        </div>
      </div>

      {/* ========================================
          SETTINGS MESSAGE
      ======================================== */}

      {message && (
        <div className="settings-message">
          {message}
        </div>
      )}

      {error && (
        <div className="settings-error">
          {error}
        </div>
      )}

      {/* ========================================
          SETTINGS CARD
      ======================================== */}

      <div className="settings-card">

        {/* ======================================
            NOTIFICATIONS
        ====================================== */}

        <section className="settings-section">

          <div className="settings-section-header">
            <h2>Notifications</h2>

            <p>
              Choose which notifications you want
              to receive.
            </p>
          </div>

          <div className="settings-options">

            {/* EMAIL */}

            <div className="settings-option">

              <div className="option-text">
                <strong>
                  Email Notifications
                </strong>

                <span>
                  Receive important updates by email.
                </span>
              </div>

              <label className="switch">

                <input
                  type="checkbox"
                  checked={notifications.email}
                  onChange={() =>
                    handleNotificationChange(
                      "email"
                    )
                  }
                />

                <span className="slider"></span>

              </label>

            </div>

            {/* PUSH */}

            <div className="settings-option">

              <div className="option-text">
                <strong>
                  Push Notifications
                </strong>

                <span>
                  Receive notifications in the
                  application.
                </span>
              </div>

              <label className="switch">

                <input
                  type="checkbox"
                  checked={notifications.push}
                  onChange={() =>
                    handleNotificationChange(
                      "push"
                    )
                  }
                />

                <span className="slider"></span>

              </label>

            </div>

            {/* PROMOTIONS */}

            <div className="settings-option">

              <div className="option-text">
                <strong>
                  Promotional Notifications
                </strong>

                <span>
                  Receive offers and promotional
                  messages.
                </span>
              </div>

              <label className="switch">

                <input
                  type="checkbox"
                  checked={
                    notifications.promotions
                  }
                  onChange={() =>
                    handleNotificationChange(
                      "promotions"
                    )
                  }
                />

                <span className="slider"></span>

              </label>

            </div>

          </div>
        </section>

        {/* ======================================
            APPEARANCE
        ====================================== */}

        <section className="settings-section">

          <div className="settings-section-header">
            <h2>Appearance</h2>

            <p>
              Choose how the dashboard should look.
            </p>
          </div>

          <div className="theme-options">

            {/* LIGHT */}

            <label
              className={`theme-option ${
                theme === "light"
                  ? "selected"
                  : ""
              }`}
            >

              <input
                type="radio"
                name="theme"
                value="light"
                checked={theme === "light"}
                onChange={handleThemeChange}
              />

              <div className="theme-content">

                <strong>
                  Light
                </strong>

                <span>
                  Use the light dashboard theme.
                </span>

              </div>

            </label>

            {/* DARK */}

            <label
              className={`theme-option ${
                theme === "dark"
                  ? "selected"
                  : ""
              }`}
            >

              <input
                type="radio"
                name="theme"
                value="dark"
                checked={theme === "dark"}
                onChange={handleThemeChange}
              />

              <div className="theme-content">

                <strong>
                  Dark
                </strong>

                <span>
                  Use the dark dashboard theme.
                </span>

              </div>

            </label>

            {/* SYSTEM */}

            <label
              className={`theme-option ${
                theme === "system"
                  ? "selected"
                  : ""
              }`}
            >

              <input
                type="radio"
                name="theme"
                value="system"
                checked={theme === "system"}
                onChange={handleThemeChange}
              />

              <div className="theme-content">

                <strong>
                  System
                </strong>

                <span>
                  Follow your device preference.
                </span>

              </div>

            </label>

          </div>
        </section>

        {/* ======================================
            SAVE SETTINGS
        ====================================== */}

        <div className="settings-actions">

          <button
            type="button"
            className="save-settings-btn"
            onClick={handleSaveSettings}
          >
            Save Settings
          </button>

        </div>

        {/* ======================================
            CHANGE PASSWORD
        ====================================== */}

        <section className="settings-section password-section">

          <div className="settings-section-header">

            <h2>
              Change Password
            </h2>

            <p>
              Update your account password to keep
              your account secure.
            </p>

          </div>

          {/* PASSWORD SUCCESS */}

          {passwordMessage && (
            <div className="password-message success">
              {passwordMessage}
            </div>
          )}

          {/* PASSWORD ERROR */}

          {passwordError && (
            <div className="password-message error">
              {passwordError}
            </div>
          )}

          <form
            className="password-form"
            onSubmit={handleChangePassword}
          >

            {/* CURRENT PASSWORD */}

            <div className="password-form-group">

              <label htmlFor="currentPassword">
                Current Password
              </label>

              <div className="password-input-wrapper">

                <input
                  id="currentPassword"
                  name="currentPassword"
                  type={
                    showPassword.current
                      ? "text"
                      : "password"
                  }
                  value={
                    passwordData.currentPassword
                  }
                  onChange={
                    handlePasswordChange
                  }
                  placeholder="Enter current password"
                  autoComplete="current-password"
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    togglePasswordVisibility(
                      "current"
                    )
                  }
                  aria-label={
                    showPassword.current
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showPassword.current
                    ? "Hide"
                    : "Show"}
                </button>

              </div>

            </div>

            {/* NEW PASSWORD */}

            <div className="password-form-group">

              <label htmlFor="newPassword">
                New Password
              </label>

              <div className="password-input-wrapper">

                <input
                  id="newPassword"
                  name="newPassword"
                  type={
                    showPassword.new
                      ? "text"
                      : "password"
                  }
                  value={
                    passwordData.newPassword
                  }
                  onChange={
                    handlePasswordChange
                  }
                  placeholder="Enter new password"
                  autoComplete="new-password"
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    togglePasswordVisibility(
                      "new"
                    )
                  }
                  aria-label={
                    showPassword.new
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showPassword.new
                    ? "Hide"
                    : "Show"}
                </button>

              </div>

              <span className="password-hint">
                Password must be at least 6
                characters.
              </span>

            </div>

            {/* CONFIRM PASSWORD */}

            <div className="password-form-group">

              <label htmlFor="confirmPassword">
                Confirm New Password
              </label>

              <div className="password-input-wrapper">

                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={
                    showPassword.confirm
                      ? "text"
                      : "password"
                  }
                  value={
                    passwordData.confirmPassword
                  }
                  onChange={
                    handlePasswordChange
                  }
                  placeholder="Confirm new password"
                  autoComplete="new-password"
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    togglePasswordVisibility(
                      "confirm"
                    )
                  }
                  aria-label={
                    showPassword.confirm
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showPassword.confirm
                    ? "Hide"
                    : "Show"}
                </button>

              </div>

            </div>

            {/* CHANGE PASSWORD BUTTON */}

            <div className="password-actions">

              <button
                type="submit"
                className="change-password-btn"
                disabled={changingPassword}
              >
                {changingPassword
                  ? "Changing Password..."
                  : "Change Password"}
              </button>

            </div>

          </form>

        </section>

      </div>
    </div>
  );
};

export default Settings;