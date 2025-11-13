import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import UploadTabContent from "../components/dashboard/UploadTabContent"; // Import the new component
import PatientDataEntry from "../components/kidney_predictor";
import { authAPI } from "../services/api";

// Icons
// UploadIcon has been moved to UploadTabContent.jsx

// Prediction Result Component
const PredictionResult = ({ prediction }) => {
  if (!prediction) return null;

  return (
    <div className="mt-6 p-6 bg-white rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-4">Prediction Results</h3>

      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="font-medium">Diagnosis:</span>
          <span
            className={`px-3 py-1 rounded-full text-sm font-semibold ${
              prediction.prediction === "Tumor"
                ? "bg-red-100 text-red-800"
                : "bg-green-100 text-green-800"
            }`}
          >
            {prediction.prediction}
          </span>
        </div>

        <div className="mb-2">
          <span className="font-medium">Confidence:</span>
          <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
            <div
              className="h-2.5 rounded-full bg-blue-600"
              style={{ width: `${prediction.confidence * 100}%` }}
            ></div>
          </div>
          <div className="text-right text-sm text-gray-600 mt-1">
            {(prediction.confidence * 100).toFixed(2)}%
          </div>
        </div>
      </div>

      <div>
        <h4 className="font-medium mb-2">Probabilities:</h4>
        <div className="space-y-2">
          {Object.entries(prediction.probabilities).map(([label, prob]) => (
            <div key={label} className="flex items-center">
              <span className="w-20 font-medium">{label}:</span>
              <div className="flex-1 bg-gray-200 rounded-full h-2.5 mx-2">
                <div
                  className={`h-2.5 rounded-full ${
                    label === "Tumor" ? "bg-red-500" : "bg-green-500"
                  }`}
                  style={{ width: `${prob * 100}%` }}
                ></div>
              </div>
              <span className="w-16 text-right text-sm text-gray-600">
                {(prob * 100).toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(() => {
    return sessionStorage.getItem("dashboardActiveTab") || "overview";
  });
  const [recentScans, setRecentScans] = useState([]);
  // const [isLoading, setIsLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [profileData, setProfileData] = useState({ name: "", email: "" });
  const [passwordData, setPasswordData] = useState({
    passwordCurrent: "",
    password: "",
    passwordConfirm: "",
  });
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      navigate("/login");
    } else {
      setProfileData({ name: user.name || "", email: user.email || "" });
    }
  }, [user, navigate]);

  // Save active tab to session storage
  useEffect(() => {
    sessionStorage.setItem("dashboardActiveTab", activeTab);
  }, [activeTab]);

  const fetchRecentScans = async () => {
    try {
      // Fetch recent scans from API

      api.getDetections().then((res) => {
        setRecentScans(res?.data?.data?.detections);
      });
      // setIsLoading(false);
    } catch (error) {
      console.error("Error fetching scans:", error);
      toast.error("Failed to load scan history");
      // setIsLoading(false);
    }
  };

  // Fetch user's recent scans
  useEffect(() => {
    if (user) {
      fetchRecentScans();
    }
  }, [user]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setIsUploading(true);
    setPrediction(null); // Clear previous prediction on new upload

    try {
      const response = await api.uploadImage(selectedFile);

      if (
        response.error ||
        !response.data ||
        response.data.status !== "success"
      ) {
        toast.error(
          response.error ||
            "Upload failed or analysis unsuccessful. Please try again."
        );
        setIsUploading(false);
        return;
      }

      const predictionData = response.data.data.prediction;
      setPrediction(predictionData);
      toast.success("Scan analyzed successfully!");

      setSelectedFile(null);
      // Attempt to clear the file input; ensure 'file-upload' is the ID of your file input in UploadTabContent.jsx
      const fileInput = document.getElementById("file-upload");
      if (fileInput) {
        fileInput.value = "";
      }
      api.getDetections().then((res) => {
        setRecentScans(res?.data?.data?.detections);
      });
    } catch (error) {
      toast.error(error.message || "Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    try {
      const response = await authAPI.updateProfile(
        profileData.name,
        profileData.email
      );
      console.log("response", response);

      if (response.error) {
        toast.error(response.error);
      } else {
        toast.success("Profile updated successfully!");
      }
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (passwordData.password !== passwordData.passwordConfirm) {
      toast.error("Passwords do not match");
      return;
    }
    setIsUpdatingPassword(true);
    try {
      const { data, error } = await authAPI.updatePassword(
        passwordData.passwordCurrent,
        passwordData.password,
        passwordData.passwordConfirm
      );
      if (error) {
        toast.error(error);
      } else {
        toast.success("Password updated successfully!");
        setPasswordData({
          passwordCurrent: "",
          password: "",
          passwordConfirm: "",
        });
      }
    } catch (error) {
      toast.error("Failed to update password");
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case "upload":
        return (
          <>
            <UploadTabContent
              selectedFile={selectedFile}
              isUploading={isUploading}
              onFileChange={handleFileChange}
              onUpload={handleUpload}
            />
            {prediction && <PredictionResult prediction={prediction} />}
          </>
        );
      case "history":
        return (
          <div className="p-4 md:p-6">
            <h2 className="text-xl md:text-2xl font-semibold mb-4 md:mb-6">
              Detection History
            </h2>

            {recentScans.length === 0 ? (
              <div className="text-center py-12">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No detections yet
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Get started by uploading an image or entering patient data.
                </p>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Image Predictions Section */}
                {recentScans.filter((scan) => scan.image !== null).length >
                  0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4 text-indigo-900 flex items-center">
                      <svg
                        className="w-5 h-5 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      Image Scans (Tumor Detection)
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                      {recentScans
                        .filter((scan) => scan.image !== null)
                        .map((scan, index) => {
                          // Convert Buffer/Binary to base64 string if needed
                          let imageUrl = null;
                          if (scan.image) {
                            if (
                              scan.image.data &&
                              Array.isArray(scan.image.data)
                            ) {
                              // Convert Buffer array to base64 in chunks to avoid call stack issues
                              const uint8Array = new Uint8Array(
                                scan.image.data
                              );
                              let binaryString = "";
                              const chunkSize = 0x8000; // 32KB chunks
                              for (
                                let i = 0;
                                i < uint8Array.length;
                                i += chunkSize
                              ) {
                                binaryString += String.fromCharCode.apply(
                                  null,
                                  uint8Array.subarray(i, i + chunkSize)
                                );
                              }
                              const base64String = btoa(binaryString);
                              imageUrl = `data:image/jpeg;base64,${base64String}`;
                            } else if (typeof scan.image === "string") {
                              // Already a base64 string
                              imageUrl = `data:image/jpeg;base64,${scan.image}`;
                            }
                          }

                          return (
                            <div
                              key={scan._id || index}
                              className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-lg transition-shadow duration-200 overflow-hidden"
                            >
                              {/* Card Header */}
                              <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-medium text-gray-600">
                                    {new Date(scan.date).toLocaleDateString(
                                      "en-US",
                                      {
                                        year: "numeric",
                                        month: "short",
                                        day: "numeric",
                                      }
                                    )}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {new Date(scan.date).toLocaleTimeString(
                                      "en-US",
                                      {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      }
                                    )}
                                  </span>
                                </div>
                              </div>

                              {/* Image Preview */}
                              {imageUrl && (
                                <div className="relative h-40 sm:h-48 bg-gray-100">
                                  <img
                                    src={imageUrl}
                                    alt="Scan"
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      e.target.style.display = "none";
                                    }}
                                  />
                                </div>
                              )}

                              {/* Card Content */}
                              <div className="p-4">
                                {scan.prediction && (
                                  <>
                                    {/* Prediction Result */}
                                    <div className="mb-3">
                                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1.5">
                                        Diagnosis
                                      </span>
                                      <div>
                                        <span
                                          className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold ${
                                            scan.prediction.prediction ===
                                              "Tumor" ||
                                            scan.prediction.prediction === "CKD"
                                              ? "bg-red-100 text-red-800"
                                              : "bg-green-100 text-green-800"
                                          }`}
                                        >
                                          {scan.prediction.prediction || "N/A"}
                                        </span>
                                      </div>
                                    </div>

                                    {/* Confidence Score */}
                                    {scan.confidence !== undefined && (
                                      <div className="mb-3">
                                        <div className="flex items-center justify-between mb-1.5">
                                          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                            Confidence
                                          </span>
                                          <span className="text-xs font-bold text-gray-900">
                                            {(scan.confidence * 100).toFixed(1)}
                                            %
                                          </span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                                          <div
                                            className="h-2.5 rounded-full bg-indigo-600 transition-all duration-300"
                                            style={{
                                              width: `${
                                                scan.confidence * 100
                                              }%`,
                                            }}
                                          ></div>
                                        </div>
                                      </div>
                                    )}

                                    {/* Probabilities */}
                                    {scan.prediction.probabilities && (
                                      <div>
                                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-2">
                                          Probabilities
                                        </span>
                                        <div className="space-y-2">
                                          {Object.entries(
                                            scan.prediction.probabilities
                                          ).map(([label, prob]) => (
                                            <div
                                              key={label}
                                              className="flex items-center gap-2"
                                            >
                                              <span className="text-xs font-medium text-gray-700 min-w-[60px] truncate">
                                                {label}
                                              </span>
                                              <div className="flex-1 bg-gray-200 rounded-full h-2">
                                                <div
                                                  className={`h-2 rounded-full transition-all duration-300 ${
                                                    label === "Tumor" ||
                                                    label === "CKD"
                                                      ? "bg-red-500"
                                                      : "bg-green-500"
                                                  }`}
                                                  style={{
                                                    width: `${prob * 100}%`,
                                                  }}
                                                ></div>
                                              </div>
                                              <span className="text-xs text-gray-600 min-w-[45px] text-right font-medium">
                                                {(prob * 100).toFixed(1)}%
                                              </span>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </>
                                )}

                                {!scan.prediction && (
                                  <div className="text-center py-6">
                                    <svg
                                      className="mx-auto h-8 w-8 text-gray-300"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                      />
                                    </svg>
                                    <p className="mt-2 text-xs text-gray-500">
                                      No prediction data
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}

                {/* Medical Data Predictions Section */}
                {recentScans.filter((scan) => scan.image === null).length >
                  0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4 text-green-900 flex items-center">
                      <svg
                        className="w-5 h-5 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      Medical Data Analysis (CKD Detection)
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                      {recentScans
                        .filter((scan) => scan.image === null)
                        .map((scan, index) => (
                          <div
                            key={scan._id || index}
                            className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-lg transition-shadow duration-200 overflow-hidden"
                          >
                            {/* Card Header */}
                            <div className="px-4 py-3 bg-green-50 border-b border-green-200">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-medium text-green-700">
                                  {new Date(scan.date).toLocaleDateString(
                                    "en-US",
                                    {
                                      year: "numeric",
                                      month: "short",
                                      day: "numeric",
                                    }
                                  )}
                                </span>
                                <span className="text-xs text-green-600">
                                  {new Date(scan.date).toLocaleTimeString(
                                    "en-US",
                                    {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    }
                                  )}
                                </span>
                              </div>
                            </div>

                            {/* Card Content */}
                            <div className="p-4">
                              {/* Prediction Result */}
                              <div className="mb-3">
                                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1.5">
                                  Diagnosis
                                </span>
                                <div>
                                  <span
                                    className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold ${
                                      scan.prediction?.prediction === "ckd" ||
                                      scan.prediction?.prediction === "CKD"
                                        ? "bg-red-100 text-red-800"
                                        : "bg-green-100 text-green-800"
                                    }`}
                                  >
                                    {scan.prediction?.prediction === "ckd"
                                      ? "CKD"
                                      : scan.prediction?.prediction?.toUpperCase() ||
                                        "N/A"}
                                  </span>
                                </div>
                              </div>

                              {/* Probability */}
                              {scan.prediction?.probability !== undefined && (
                                <div className="mb-3">
                                  <div className="flex items-center justify-between mb-1.5">
                                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                      Probability
                                    </span>
                                    <span className="text-xs font-bold text-gray-900">
                                      {(
                                        scan.prediction.probability * 100
                                      ).toFixed(1)}
                                      %
                                    </span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                                    <div
                                      className="h-2.5 rounded-full bg-green-600 transition-all duration-300"
                                      style={{
                                        width: `${
                                          scan.prediction.probability * 100
                                        }%`,
                                      }}
                                    ></div>
                                  </div>
                                </div>
                              )}

                              {/* Metrics */}
                              {(scan.prediction?.precision !== undefined ||
                                scan.prediction?.recall !== undefined) && (
                                <div className="grid grid-cols-2 gap-3 mt-4">
                                  {scan.prediction.precision !== undefined && (
                                    <div className="bg-blue-50 rounded-lg p-3">
                                      <span className="text-xs text-gray-600 block mb-1">
                                        Precision
                                      </span>
                                      <span className="text-lg font-bold text-blue-700">
                                        {(
                                          scan.prediction.precision * 100
                                        ).toFixed(1)}
                                        %
                                      </span>
                                    </div>
                                  )}
                                  {scan.prediction.recall !== undefined && (
                                    <div className="bg-purple-50 rounded-lg p-3">
                                      <span className="text-xs text-gray-600 block mb-1">
                                        Recall
                                      </span>
                                      <span className="text-lg font-bold text-purple-700">
                                        {(scan.prediction.recall * 100).toFixed(
                                          1
                                        )}
                                        %
                                      </span>
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Confusion Matrix Preview */}
                              {scan.prediction?.confusion_matrix && (
                                <div className="mt-4 pt-4 border-t border-gray-200">
                                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-2">
                                    Confusion Matrix
                                  </span>
                                  <div className="grid grid-cols-2 gap-2 text-xs">
                                    <div className="bg-green-50 p-2 rounded text-center">
                                      <div className="font-semibold text-green-800">
                                        TN
                                      </div>
                                      <div className="text-lg font-bold text-green-900">
                                        {scan.prediction
                                          .confusion_matrix[0]?.[0] || 0}
                                      </div>
                                    </div>
                                    <div className="bg-orange-50 p-2 rounded text-center">
                                      <div className="font-semibold text-orange-800">
                                        FP
                                      </div>
                                      <div className="text-lg font-bold text-orange-900">
                                        {scan.prediction
                                          .confusion_matrix[0]?.[1] || 0}
                                      </div>
                                    </div>
                                    <div className="bg-red-50 p-2 rounded text-center">
                                      <div className="font-semibold text-red-800">
                                        FN
                                      </div>
                                      <div className="text-lg font-bold text-red-900">
                                        {scan.prediction
                                          .confusion_matrix[1]?.[0] || 0}
                                      </div>
                                    </div>
                                    <div className="bg-blue-50 p-2 rounded text-center">
                                      <div className="font-semibold text-blue-800">
                                        TP
                                      </div>
                                      <div className="text-lg font-bold text-blue-900">
                                        {scan.prediction
                                          .confusion_matrix[1]?.[1] || 0}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      case "dataEntry":
        return (
          <div className="p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold mb-4">
              Patient Data Entry
            </h2>
            <PatientDataEntry fetchRecentScans={fetchRecentScans} />
          </div>
        );
      case "settings":
        return (
          <div className="p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">
              Account Settings
            </h2>

            {/* Update Profile Section */}
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6">
              <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">
                Update Profile
              </h3>
              <form
                onSubmit={handleProfileUpdate}
                className="space-y-3 sm:space-y-4"
              >
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={profileData.name}
                    onChange={(e) =>
                      setProfileData({ ...profileData, name: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={profileData.email}
                    onChange={(e) =>
                      setProfileData({ ...profileData, email: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={isUpdatingProfile}
                  className="w-full sm:w-auto px-4 py-2 text-sm sm:text-base bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                >
                  {isUpdatingProfile ? "Updating..." : "Update Profile"}
                </button>
              </form>
            </div>

            {/* Change Password Section */}
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">
                Change Password
              </h3>
              <form
                onSubmit={handlePasswordUpdate}
                className="space-y-3 sm:space-y-4"
              >
                <div>
                  <label
                    htmlFor="currentPassword"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Current Password
                  </label>
                  <input
                    type="password"
                    id="currentPassword"
                    value={passwordData.passwordCurrent}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        passwordCurrent: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="newPassword"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    New Password
                  </label>
                  <input
                    type="password"
                    id="newPassword"
                    value={passwordData.password}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        password: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                    minLength={8}
                  />
                </div>
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    value={passwordData.passwordConfirm}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        passwordConfirm: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                    minLength={8}
                  />
                </div>
                <button
                  type="submit"
                  disabled={isUpdatingPassword}
                  className="w-full sm:w-auto px-4 py-2 text-sm sm:text-base bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                >
                  {isUpdatingPassword ? "Updating..." : "Change Password"}
                </button>
              </form>
            </div>
          </div>
        );
      case "overview":
      default:
        return (
          <div className="p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold mb-4">
              Welcome back, {user?.name || "User"}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
              <div className="bg-indigo-50 p-4 sm:p-6 rounded-lg border border-indigo-100 shadow-sm">
                <h3 className="text-sm sm:text-lg font-medium text-indigo-800 mb-1 sm:mb-2">
                  Total Scans
                </h3>
                <p className="text-2xl sm:text-3xl font-bold text-indigo-600">
                  {recentScans.length}
                </p>
              </div>
              <div className="bg-green-50 p-4 sm:p-6 rounded-lg border border-green-100 shadow-sm">
                <h3 className="text-sm sm:text-lg font-medium text-green-800 mb-1 sm:mb-2">
                  Image Results
                </h3>
                <p className="text-2xl sm:text-3xl font-bold text-green-600">
                  {recentScans.filter((scan) => scan.image).length}
                </p>
              </div>
              <div className="bg-red-50 p-4 sm:p-6 rounded-lg border border-red-100 shadow-sm sm:col-span-2 lg:col-span-1">
                <h3 className="text-sm sm:text-lg font-medium text-red-800 mb-1 sm:mb-2">
                  Medical Data Results
                </h3>
                <p className="text-2xl sm:text-3xl font-bold text-red-600">
                  {recentScans.filter((scan) => scan.image === null).length}
                </p>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            Kidney Cancer Detection
          </h1>
        </div>

        {/* Main Navigation Tabs */}
        <div className="border-b border-gray-200 mb-6 overflow-y-hidden overflow-x-auto">
          <nav className="-mb-px flex space-x-4 sm:space-x-8 min-w-max sm:min-w-0">
            <button
              onClick={() => setActiveTab("overview")}
              className={`whitespace-nowrap py-3 sm:py-4 px-2 sm:px-1 border-b-2 font-medium text-xs sm:text-sm ${
                activeTab === "overview"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("upload")}
              className={`whitespace-nowrap py-3 sm:py-4 px-2 sm:px-1 border-b-2 font-medium text-xs sm:text-sm ${
                activeTab === "upload"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Upload
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`whitespace-nowrap py-3 sm:py-4 px-2 sm:px-1 border-b-2 font-medium text-xs sm:text-sm ${
                activeTab === "history"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              History
            </button>
            <button
              onClick={() => setActiveTab("dataEntry")}
              className={`whitespace-nowrap py-3 sm:py-4 px-2 sm:px-1 border-b-2 font-medium text-xs sm:text-sm ${
                activeTab === "dataEntry"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Data Entry
            </button>
            <button
              onClick={() => setActiveTab("settings")}
              className={`whitespace-nowrap py-3 sm:py-4 px-2 sm:px-1 border-b-2 font-medium text-xs sm:text-sm ${
                activeTab === "settings"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Settings
            </button>
          </nav>
        </div>

        {/* Main Content Area */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
