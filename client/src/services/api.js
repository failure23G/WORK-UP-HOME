import axios from "axios";

const API = axios.create({
  baseURL: "http://127.0.0.1:5000/api",

  // এখানে Content-Type দেবে না।
  // Axios নিজে FormData হলে multipart/form-data boundary সেট করবে।
  withCredentials: true,
});

// ========================================
// REQUEST INTERCEPTOR
// ========================================

API.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem("token");

    if (token) {
      config.headers =
        config.headers || {};

      config.headers.Authorization =
        `Bearer ${token}`;
    }

    // ====================================
    // FORM DATA CHECK
    // ====================================

    if (
      config.data instanceof FormData
    ) {
      // JSON Content-Type remove
      if (
        config.headers &&
        config.headers["Content-Type"]
      ) {
        delete config.headers[
          "Content-Type"
        ];
      }

      if (
        config.headers &&
        config.headers[
          "content-type"
        ]
      ) {
        delete config.headers[
          "content-type"
        ];
      }
    }

    return config;
  },

  (error) => {
    return Promise.reject(error);
  }
);

// ========================================
// RESPONSE INTERCEPTOR
// ========================================

API.interceptors.response.use(
  (response) => {
    return response;
  },

  (error) => {
    if (
      error?.response?.status === 401
    ) {
      // Token invalid হলে
      // localStorage থেকে remove
      localStorage.removeItem(
        "token"
      );
    }

    return Promise.reject(error);
  }
);

export default API;