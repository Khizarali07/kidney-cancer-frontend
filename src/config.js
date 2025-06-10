// API Configuration
export const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5000/api/v1";

// CORS configuration
export const CORS_CONFIG = {
  origin: process.env.REACT_APP_API_ORIGIN || "http://localhost:3000",
  credentials: true, // Important for cookies
};

// App Configuration
export const APP_NAME = "Kidney Cancer Detection";

// Navigation Items
export const NAV_ITEMS = [
  { name: "Home", path: "/" },
  { name: "About", path: "/about" },
  { name: "Services", path: "/services" },
  { name: "Contact", path: "/contact" },
];

// Authenticated Navigation Items
export const AUTH_NAV_ITEMS = [
  { name: "Dashboard", path: "/dashboard" },
  { name: "Upload Scan", path: "/upload" },
  { name: "History", path: "/history" },
  { name: "Profile", path: "/profile" },
];
