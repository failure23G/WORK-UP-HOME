import { useEffect, useRef, useState } from "react";
import {
  getMe,
  updateProfile,
  uploadProfileImage,
} from "../../services/authService";
import "./Profile.css";

const Profile = () => {
  const [user, setUser] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    bio: "",
  });

  const [selectedImage, setSelectedImage] = useState(null);
  const [previewImage, setPreviewImage] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [editing, setEditing] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fileInputRef = useRef(null);

  // ========================================
  // LOAD PROFILE
  // ========================================
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);

        const data = await getMe();

        const currentUser =
          data?.user || data?.data || data;

        setUser(currentUser);

        setFormData({
          name: currentUser?.name || "",
          email: currentUser?.email || "",
          phone: currentUser?.phone || "",
          bio: currentUser?.bio || "",
        });

        if (currentUser?.profileImage) {
          setPreviewImage(
            currentUser.profileImage.startsWith("http")
              ? currentUser.profileImage
              : `http://localhost:5000${currentUser.profileImage}`
          );
        }
      } catch (err) {
        console.error("Failed to load profile:", err);

        setError(
          err?.response?.data?.message ||
            "Failed to load profile"
        );
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  // ========================================
  // HANDLE TEXT INPUT
  // ========================================
  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ========================================
  // START EDIT
  // ========================================
  const handleEdit = () => {
    setMessage("");
    setError("");
    setEditing(true);
  };

  // ========================================
  // CANCEL EDIT
  // ========================================
  const handleCancel = () => {
    setFormData({
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      bio: user?.bio || "",
    });

    setMessage("");
    setError("");
    setEditing(false);
  };

  // ========================================
  // SELECT IMAGE
  // ========================================
  const handleImageSelect = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setMessage("");
    setError("");

    // Check image type
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError(
        "Only JPG, JPEG, PNG and WEBP images are allowed"
      );

      event.target.value = "";
      return;
    }

    // Check image size
    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5MB");

      event.target.value = "";
      return;
    }

    setSelectedImage(file);

    const previewUrl = URL.createObjectURL(file);

    setPreviewImage(previewUrl);
  };

  // ========================================
  // UPLOAD IMAGE
  // ========================================
  const handleImageUpload = async () => {
    if (!selectedImage) {
      setError("Please select an image first");
      return;
    }

    try {
      setUploadingImage(true);

      setMessage("");
      setError("");

      const data =
        await uploadProfileImage(selectedImage);

      const updatedUser =
        data?.user || data?.data;

      if (updatedUser) {
        setUser(updatedUser);
      }

      if (data?.profileImage) {
        const imageUrl =
          data.profileImage.startsWith("http")
            ? data.profileImage
            : `http://localhost:5000${data.profileImage}`;

        setPreviewImage(imageUrl);
      }

      setSelectedImage(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      setMessage(
        data?.message ||
          "Profile picture uploaded successfully"
      );
    } catch (err) {
      console.error(
        "Profile image upload error:",
        err
      );

      setError(
        err?.response?.data?.message ||
          "Failed to upload profile picture"
      );
    } finally {
      setUploadingImage(false);
    }
  };

  // ========================================
  // SAVE PROFILE
  // ========================================
  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage("");
    setError("");

    if (!formData.name.trim()) {
      setError("Name is required");
      return;
    }

    if (!formData.email.trim()) {
      setError("Email is required");
      return;
    }

    try {
      setSaving(true);

      const data = await updateProfile({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        bio: formData.bio.trim(),
      });

      const updatedUser =
        data?.user || data?.data || data;

      setUser(updatedUser);

      setFormData({
        name: updatedUser?.name || "",
        email: updatedUser?.email || "",
        phone: updatedUser?.phone || "",
        bio: updatedUser?.bio || "",
      });

      setEditing(false);

      setMessage(
        data?.message ||
          "Profile updated successfully"
      );
    } catch (err) {
      console.error(
        "Update profile error:",
        err
      );

      setError(
        err?.response?.data?.message ||
          "Failed to update profile"
      );
    } finally {
      setSaving(false);
    }
  };

  // ========================================
  // LOADING
  // ========================================
  if (loading) {
    return (
      <div className="profile-page">
        <div className="profile-loading">
          Loading profile...
        </div>
      </div>
    );
  }

  // ========================================
  // USER DATA
  // ========================================
  const userName =
    user?.name || user?.fullName || "User";

  const initial = userName
    .charAt(0)
    .toUpperCase();

  // ========================================
  // PROFILE PAGE
  // ========================================
  return (
    <div className="profile-page">
      <div className="profile-header">
        <div>
          <h1>My Profile</h1>

          <p>
            View and manage your personal information.
          </p>
        </div>
      </div>

      {/* SUCCESS MESSAGE */}
      {message && (
        <div className="profile-message success">
          {message}
        </div>
      )}

      {/* ERROR MESSAGE */}
      {error && (
        <div className="profile-message error">
          {error}
        </div>
      )}

      <div className="profile-card">
        {/* ========================================
            PROFILE TOP
        ======================================== */}

        <div className="profile-top">
          <div className="profile-avatar-wrapper">
            <div className="profile-avatar">
              {previewImage ? (
                <img
                  src={previewImage}
                  alt="Profile"
                />
              ) : (
                <span>{initial}</span>
              )}
            </div>

            <button
              type="button"
              className="change-photo-btn"
              onClick={() =>
                fileInputRef.current?.click()
              }
              disabled={uploadingImage}
            >
              Change Photo
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleImageSelect}
              className="profile-file-input"
            />
          </div>

          <div className="profile-name">
            <h2>{userName}</h2>

            <p>
              {user?.email ||
                "No email available"}
            </p>
          </div>
        </div>

        {/* ========================================
            SELECTED IMAGE UPLOAD
        ======================================== */}

        {selectedImage && (
          <div className="image-upload-box">
            <div>
              <strong>
                {selectedImage.name}
              </strong>

              <span>
                Ready to upload
              </span>
            </div>

            <div className="image-upload-actions">
              <button
                type="button"
                className="upload-image-btn"
                onClick={handleImageUpload}
                disabled={uploadingImage}
              >
                {uploadingImage
                  ? "Uploading..."
                  : "Upload Photo"}
              </button>

              <button
                type="button"
                className="remove-image-btn"
                onClick={() => {
                  setSelectedImage(null);

                  if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                  }

                  if (user?.profileImage) {
                    setPreviewImage(
                      user.profileImage.startsWith(
                        "http"
                      )
                        ? user.profileImage
                        : `http://localhost:5000${user.profileImage}`
                    );
                  } else {
                    setPreviewImage("");
                  }
                }}
                disabled={uploadingImage}
              >
                Remove
              </button>
            </div>
          </div>
        )}

        {!editing ? (
          <>
            {/* ========================================
                VIEW PROFILE
            ======================================== */}

            <div className="profile-info">
              <div className="profile-field">
                <span className="field-label">
                  Full Name
                </span>

                <strong>
                  {userName}
                </strong>
              </div>

              <div className="profile-field">
                <span className="field-label">
                  Email
                </span>

                <strong>
                  {user?.email ||
                    "Not available"}
                </strong>
              </div>

              <div className="profile-field">
                <span className="field-label">
                  Phone
                </span>

                <strong>
                  {user?.phone ||
                    "Not added"}
                </strong>
              </div>

              <div className="profile-field">
                <span className="field-label">
                  Account Status
                </span>

                <strong className="status-active">
                  Active
                </strong>
              </div>

              <div className="profile-field profile-bio">
                <span className="field-label">
                  Bio
                </span>

                <strong>
                  {user?.bio ||
                    "No bio added yet."}
                </strong>
              </div>
            </div>

            <div className="profile-actions">
              <button
                type="button"
                className="edit-profile-btn"
                onClick={handleEdit}
              >
                Edit Profile
              </button>
            </div>
          </>
        ) : (
          <>
            {/* ========================================
                EDIT PROFILE
            ======================================== */}

            <form
              className="profile-form"
              onSubmit={handleSubmit}
            >
              <div className="form-group">
                <label htmlFor="name">
                  Full Name
                </label>

                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">
                  Email
                </label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">
                  Phone
                </label>

                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter your phone number"
                />
              </div>

              <div className="form-group full-width">
                <label htmlFor="bio">
                  Bio
                </label>

                <textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="Tell us about yourself..."
                  rows="5"
                  maxLength="500"
                />

                <span className="character-count">
                  {formData.bio.length}/500
                </span>
              </div>

              <div className="profile-form-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={handleCancel}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save-profile-btn"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : "Save Changes"}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default Profile;