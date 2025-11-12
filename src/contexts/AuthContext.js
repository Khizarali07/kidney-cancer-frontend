// frontend/src/contexts/AuthContext.js
import {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
} from "react";
// import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import Cookies from "js-cookie";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  // const navigate = useNavigate();

  const logout = useCallback(async () => {
    try {
      await axios.get(`${process.env.REACT_APP_API_BASE_URL}/auth/logout`, {
        withCredentials: true,
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      Cookies.remove("auth_token");
      // navigate("/login");
    }
  }, []);

  const checkAuth = useCallback(async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/auth/me`,
        {
          withCredentials: true,
        }
      );
      console.log(response.data);
      setUser(response.data.data.user);

      toast.success("Logged in successfully!");
      return { success: true };
    } catch (error) {
      console.error("Auth check failed:", error);
      logout();
    } finally {
      setIsLoading(false);
    }
  }, [logout]);

  // Check if user is logged in on initial load
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (email, password) => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/auth/login`,
        { email, password },
        { withCredentials: true }
      );

      const { token } = response.data;
      if (token) {
        setUser(response.data.data.user);
        toast.success("Logged in successfully!");
        return { success: true };
      }
      return { success: false, error: "No token received" };
    } catch (error) {
      console.error("Login error:", error);
      const errorMessage =
        error.response?.data?.message || "Login failed. Please try again.";
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const signup = async (email, password) => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/auth/signup`,
        { email, password },
        { withCredentials: true }
      );

      const { token } = response.data;
      if (token) {
        setUser(response.data.data.user);
        toast.success("Logged in successfully!");
        return { success: true };
      }
      return { success: false, error: "No token received" };
    } catch (error) {
      console.error("Login error:", error);
      const errorMessage =
        error.response?.data?.message || "Login failed. Please try again.";
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        signup,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {!isLoading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
