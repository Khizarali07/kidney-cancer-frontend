import axios from "axios";
import { API_BASE_URL } from "../config";

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Required for cookies
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Request interceptor to add auth headers if needed
api.interceptors.request.use(
  (config) => {
    // You can add auth headers here if needed
    // The cookie will be sent automatically with withCredentials: true
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized errors (token expired/invalid)
    if (error.response?.status === 401) {
      // Redirect to login page on unauthorized
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// API functions
export const authAPI = {
  login: async (email, password) => {
    try {
      const response = await api.post("/auth/login", { email, password });
      return { data: response.data, error: null };
    } catch (error) {
      return {
        data: null,
        error: error.response?.data?.message || "Login failed",
      };
    }
  },

  signup: async (name, email, password, passwordConfirm) => {
    try {
      const response = await api.post("/auth/signup", {
        name,
        email,
        password,
        passwordConfirm,
      });
      return { data: response.data, error: null };
    } catch (error) {
      return {
        data: null,
        error: error.response?.data?.message || "Signup failed",
      };
    }
  },

  getCurrentUser: async () => {
    try {
      const response = await api.get("/auth/me");
      return { data: response.data, error: null };
    } catch (error) {
      return {
        data: null,
        error: error.response?.data?.message || "Failed to fetch user",
      };
    }
  },

  logout: async () => {
    try {
      await api.post("/auth/logout");
      return { success: true, error: null };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Logout failed",
      };
    }
  },

  updateProfile: async (name, email) => {
    try {
      const response = await api.patch("/auth/updateMe", { name, email });
      return { data: response.data, error: null };
    } catch (error) {
      return {
        data: null,
        error: error.response?.data?.message || "Update profile failed",
      };
    }
  },

  updatePassword: async (passwordCurrent, password, passwordConfirm) => {
    try {
      const response = await api.post("/auth/updateMyPassword", {
        passwordCurrent,
        password,
        passwordConfirm,
      });
      return { data: response.data, error: null };
    } catch (error) {
      return {
        data: null,
        error: error.response?.data?.message || "Update password failed",
      };
    }
  },
}; // End of authAPI

// Add uploadImage directly to the api (axios instance) object
api.uploadImage = async (file) => {
  try {
    const formData = new FormData();
    formData.append("image", file);

    const response = await axios.post(
      `${process.env.REACT_APP_API_BASE_URL}/detection`,
      formData,
      {
        withCredentials: true, // Required for cookies
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return { data: response.data, error: null };
  } catch (error) {
    return {
      data: null,
      error: error.response?.data?.message || "Upload failed",
    };
  }
};

api.getDetections = async () => {
  try {
    const response = await api.get("/detection/get-detections");
    return { data: response.data, error: null };
  } catch (error) {
    return {
      data: null,
      error: error.response?.data?.message || "Failed to fetch detections",
    };
  }
};

export default api;
