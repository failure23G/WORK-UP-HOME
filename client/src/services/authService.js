import API from "./api";

// ========================================
// REGISTER
// ========================================

export const registerUser = async (userData) => {
  const response = await API.post(
    "/auth/register",
    userData
  );

  return response.data;
};

// ========================================
// LOGIN
// ========================================

export const loginUser = async (userData) => {
  const response = await API.post(
    "/auth/login",
    userData
  );

  return response.data;
};

// ========================================
// CURRENT USER
// ========================================

export const getCurrentUser = async () => {
  const response = await API.get("/auth/me");

  return response.data;
};

// ========================================
// GET ME
// ========================================

export const getMe = async () => {
  const response = await API.get("/auth/me");

  return response.data;
};

// ========================================
// UPDATE PROFILE
// ========================================

export const updateProfile = async (userData) => {
  const response = await API.put(
    "/auth/profile",
    userData
  );

  return response.data;
};

// ========================================
// UPLOAD PROFILE IMAGE
// ========================================

export const uploadProfileImage = async (formData) => {
  const response = await API.post(
    "/auth/profile/image",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};

// ========================================
// CHANGE PASSWORD
// ========================================

export const changePassword = async (passwordData) => {
  const response = await API.put(
    "/auth/change-password",
    passwordData
  );

  return response.data;
};