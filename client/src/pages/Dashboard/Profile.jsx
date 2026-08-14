import { useEffect, useRef, useState } from "react";
import {
  getMe,
  updateProfile,
  uploadProfileImage,
} from "../../services/authService";
import "./Profile.css";

const API_URL = "https://work-up-home.onrender.com";

const getUserFromResponse = (response) => {
  if (!response) return null;

  if (response.user) return response.user;

  if (response.data?.user) return response.data.user;

  if (response.data && !response.data.success) {
    return response.data;
  }

  if (response.data?.data) {
    return response.data.data;
  }

  if (response.data) {
    return response.data;
  }

  return response;
};

const getImageUrl = (image) => {
  if (!image) return "";

  if (
    image.startsWith("http://") ||
    image.startsWith("https://") ||
    image.startsWith("blob:")
  ) {
    return image;
  }

  return `${API_URL}${image.startsWith("/") ? "" : "/"}${image}`;
};

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

  /* =====================================================
     LOAD PROFILE
     ===================================================== */

  useEffect(() => {
    let mounted = true;

    const loadProfile = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getMe();

        const currentUser = getUserFromResponse(response);

        console.log("PROFILE RESPONSE:", response);
        console.log("CURRENT USER:", currentUser);

        if (!mounted) return;

        if (!currentUser) {
          throw new Error("User profile data not found");
        }

        setUser(currentUser);

        setFormData({
          name:
            currentUser.name ||
            currentUser.fullName ||
            "",
          email: currentUser.email || "",
          phone:
            currentUser.phone ||
            currentUser.mobile ||
            "",
          bio: currentUser.bio || "",
        });

        const image =
          currentUser.profileImage ||
          currentUser.profile_image ||
          currentUser.avatar ||
          "";

        if (image) {
          setPreviewImage(getImageUrl(image));
        } else {
          setPreviewImage("");
        }
      } catch (err) {
        console.error("Failed to load profile:", err);

        if (!mounted) return;

        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to load profile"
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      mounted = false;
    };
  }, []);

  /* =====================================================
     FORM CHANGE
     ===================================================== */

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  /* =====================================================
     START EDIT
     ===================================================== */

  const handleEdit = () => {
    setMessage("");
    setError("");
    setEditing(true);
  };

  /* =====================================================
     CANCEL EDIT
     ===================================================== */

  const handleCancel = () => {
    setFormData({
      name:
        user?.name ||
        user?.fullName ||
        "",
      email: user?.email || "",
      phone:
        user?.phone ||
        user?.mobile ||
        "",
      bio: user?.bio || "",
    });

    setMessage("");
    setError("");
    setEditing(false);
  };

  /* =====================================================
     IMAGE SELECT
     ===================================================== */

  const handleImageSelect = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setMessage("");
    setError("");

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

    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5MB");

      event.target.value = "";
      return;
    }

    setSelectedImage(file);

    const previewUrl = URL.createObjectURL(file);

    setPreviewImage(previewUrl);
  };

  /* =====================================================
     UPLOAD IMAGE
     ===================================================== */

  const handleImageUpload = async () => {
    if (!selectedImage) {
      setError("Please select an image first");
      return;
    }

    try {
      setUploadingImage(true);
      setMessage("");
      setError("");

      const response =
        await uploadProfileImage(selectedImage);

      console.log(
        "PROFILE IMAGE RESPONSE:",
        response
      );

      const updatedUser =
        getUserFromResponse(response);

      if (updatedUser) {
        setUser(updatedUser);

        setFormData({
          name:
            updatedUser.name ||
            updatedUser.fullName ||
            "",
          email: updatedUser.email || "",
          phone:
            updatedUser.phone ||
            updatedUser.mobile ||
            "",
          bio: updatedUser.bio || "",
        });
      }

      const uploadedImage =
        response?.profileImage ||
        response?.data?.profileImage ||
        response?.user?.profileImage ||
        updatedUser?.profileImage;

      if (uploadedImage) {
        setPreviewImage(
          getImageUrl(uploadedImage)
        );
      }

      setSelectedImage(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      setMessage(
        response?.message ||
          "Profile picture uploaded successfully"
      );
    } catch (err) {
      console.error(
        "Profile image upload error:",
        err
      );

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to upload profile picture"
      );
    } finally {
      setUploadingImage(false);
    }
  };

  /* =====================================================
     REMOVE SELECTED IMAGE
     ===================================================== */

  const handleRemoveSelectedImage = () => {
    setSelectedImage(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    const existingImage =
      user?.profileImage ||
      user?.profile_image ||
      user?.avatar ||
      "";

    setPreviewImage(
      existingImage
        ? getImageUrl(existingImage)
        : ""
    );

    setMessage("");
    setError("");
  };

  /* =====================================================
     SAVE PROFILE
     ===================================================== */

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage("");
    setError("");

    const cleanName = formData.name.trim();
    const cleanEmail = formData.email.trim();
    const cleanPhone = formData.phone.trim();
    const cleanBio = formData.bio.trim();

    if (!cleanName) {
      setError("Name is required");
      return;
    }

    if (!cleanEmail) {
      setError("Email is required");
      return;
    }

    try {
      setSaving(true);

      const response = await updateProfile({
        name: cleanName,
        email: cleanEmail,
        phone: cleanPhone,
        bio: cleanBio,
      });

      console.log(
        "UPDATE PROFILE RESPONSE:",
        response
      );

      const updatedUser =
        getUserFromResponse(response);

      if (!updatedUser) {
        throw new Error(
          "Profile was updated but user data was not returned"
        );
      }

      setUser(updatedUser);

      setFormData({
        name:
          updatedUser.name ||
          updatedUser.fullName ||
          "",
        email: updatedUser.email || "",
        phone:
          updatedUser.phone ||
          updatedUser.mobile ||
          "",
        bio: updatedUser.bio || "",
      });

      setEditing(false);

      setMessage(
        response?.message ||
          response?.data?.message ||
          "Profile updated successfully"
      );
    } catch (err) {
      console.error(
        "Update profile error:",
        err
      );

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to update profile"
      );
    } finally {
      setSaving(false);
    }
  };

  /* =====================================================
     LOADING
     ===================================================== */

  if (loading) {
    return (
      <div className="wuh-profile-page">
        <div className="wuh-profile-loading">
          <div className="wuh-spinner"></div>
          <span>Loading profile...</span>
        </div>
      </div>
    );
  }

  /* =====================================================
     USER DATA
     ===================================================== */

  const userName =
    user?.name ||
    user?.fullName ||
    "User";

  const userEmail =
    user?.email ||
    "Not available";

  const userPhone =
    user?.phone ||
    user?.mobile ||
    "Not added";

  const userBio =
    user?.bio ||
    "No bio added yet.";

  const initial =
    userName.charAt(0).toUpperCase();

  /* =====================================================
     PROFILE
     ===================================================== */

  return (
    <div className="wuh-profile-page">

<button
  type="button"
  onClick={() => window.location.href = "/dashboard"}
  style={{
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "13px 20px",
    marginBottom: "24px",
    border: "none",
    borderRadius: "12px",
    background: "#ffffff",
    color: "#4f46e5",
    fontSize: "15px",
    fontWeight: "700",
    cursor: "pointer",
    boxShadow: "0 5px 18px rgba(79, 70, 229, 0.10)"
  }}
>
  ← Back to Dashboard
</button>

      {/* ================= HEADER ================= */}

      <div className="wuh-profile-header">
        <h1>My Profile</h1>

        <p>
          View and manage your personal information.
        </p>
      </div>

      {/* ================= MESSAGE ================= */}

      {message && (
        <div className="wuh-profile-message wuh-success">
          {message}
        </div>
      )}

      {error && (
        <div className="wuh-profile-message wuh-error">
          {error}
        </div>
      )}

      {/* ================= CARD ================= */}

      <div className="wuh-profile-card">

        {/* ================= TOP ================= */}

        <div className="wuh-profile-top">

          <div className="wuh-avatar-area">

            <div className="wuh-avatar">

              {previewImage ? (
                <img
                  src={previewImage}
                  alt="Profile"
                  onError={(event) => {
                    event.currentTarget.style.display =
                      "none";
                  }}
                />
              ) : (
                <span>{initial}</span>
              )}

            </div>

            <button
              type="button"
              className="wuh-change-photo"
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
              className="wuh-file-input"
            />

          </div>

          <div className="wuh-user-heading">

            <h2>{userName}</h2>

            <p>{userEmail}</p>

          </div>

        </div>

        {/* ================= IMAGE UPLOAD ================= */}

        {selectedImage && (
          <div className="wuh-upload-box">

            <div className="wuh-upload-info">

              <strong>
                {selectedImage.name}
              </strong>

              <span>
                Ready to upload
              </span>

            </div>

            <div className="wuh-upload-actions">

              <button
                type="button"
                className="wuh-upload-btn"
                onClick={handleImageUpload}
                disabled={uploadingImage}
              >
                {uploadingImage
                  ? "Uploading..."
                  : "Upload Photo"}
              </button>

              <button
                type="button"
                className="wuh-remove-btn"
                onClick={
                  handleRemoveSelectedImage
                }
                disabled={uploadingImage}
              >
                Remove
              </button>

            </div>

          </div>
        )}

        {/* =================================================
            VIEW PROFILE
        ================================================= */}

        {!editing ? (
          <>

            <div className="wuh-profile-info">

              {/* FULL NAME */}

              <div className="wuh-info-box">

                <span className="wuh-info-label">
                  Full Name
                </span>

                <strong>
                  {userName}
                </strong>

              </div>

              {/* EMAIL */}

              <div className="wuh-info-box">

                <span className="wuh-info-label">
                  Email
                </span>

                <strong>
                  {userEmail}
                </strong>

              </div>

              {/* PHONE */}

              <div className="wuh-info-box">

                <span className="wuh-info-label">
                  Phone
                </span>

                <strong>
                  {userPhone}
                </strong>

              </div>

              {/* ACCOUNT STATUS */}

              <div className="wuh-info-box">

                <span className="wuh-info-label">
                  Account Status
                </span>

                <strong className="wuh-active">
                  Active
                </strong>

              </div>

              {/* BIO */}

              <div className="wuh-info-box wuh-bio-box">

                <span className="wuh-info-label">
                  Bio
                </span>

                <strong>
                  {userBio}
                </strong>

              </div>

            </div>

            {/* EDIT BUTTON */}

            <div className="wuh-profile-actions">

              <button
                type="button"
                className="wuh-edit-btn"
                onClick={handleEdit}
              >
                Edit Profile
              </button>

            </div>

          </>
        ) : (

          /* =================================================
             EDIT PROFILE
          ================================================= */

          <form
            className="wuh-profile-form"
            onSubmit={handleSubmit}
          >

            {/* NAME */}

            <div className="wuh-form-group">

              <label htmlFor="profile-name">
                Full Name
              </label>

              <input
                id="profile-name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your name"
                autoComplete="name"
              />

            </div>

            {/* EMAIL */}

            <div className="wuh-form-group">

              <label htmlFor="profile-email">
                Email
              </label>

              <input
                id="profile-email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                autoComplete="email"
              />

            </div>

            {/* PHONE */}

            <div className="wuh-form-group">

              <label htmlFor="profile-phone">
                Phone
              </label>

              <input
                id="profile-phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter your phone number"
                autoComplete="tel"
              />

            </div>

            {/* BIO */}

            <div className="wuh-form-group wuh-full-width">

              <label htmlFor="profile-bio">
                Bio
              </label>

              <textarea
                id="profile-bio"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                placeholder="Tell us about yourself..."
                rows={5}
                maxLength={500}
              />

              <span className="wuh-character-count">
                {formData.bio.length}/500
              </span>

            </div>

            {/* FORM BUTTONS */}

            <div className="wuh-form-actions">

              <button
                type="button"
                className="wuh-cancel-btn"
                onClick={handleCancel}
                disabled={saving}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="wuh-save-btn"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : "Save Changes"}
              </button>

            </div>

          </form>

        )}

      </div>
    </div>
  );
};

export default Profile;