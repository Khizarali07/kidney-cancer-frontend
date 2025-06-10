import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import UploadTabContent from "../components/dashboard/UploadTabContent"; // Import the new component

// Icons
// UploadIcon has been moved to UploadTabContent.jsx

const HistoryIcon = ({ className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={`h-6 w-6 ${className}`}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

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
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [recentScans, setRecentScans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [prediction, setPrediction] = useState(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  // Fetch user's recent scans
  useEffect(() => {
    const fetchRecentScans = async () => {
      try {
        // Mock data for now
        setTimeout(() => {
          setRecentScans([
            {
              id: 1,
              date: "2023-05-15",
              status: "Completed",
              result: "Normal",
            },
            {
              id: 2,
              date: "2023-04-28",
              status: "Completed",
              result: "Abnormal",
            },
            {
              id: 3,
              date: "2023-04-10",
              status: "Completed",
              result: "Normal",
            },
          ]);
          setIsLoading(false);
        }, 1000);
      } catch (error) {
        console.error("Error fetching scans:", error);
        toast.error("Failed to load scan history");
        setIsLoading(false);
      }
    };

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

  // const handleUpload = async () => {
  //   if (!selectedFile) return;
  //   setIsUploading(true);
  //   const formData = new FormData();
  //   formData.append("image", selectedFile); // API expects the file under the key "image"

  //   try {
  //     const response = await api.uploadImage(selectedFile);

  //     if (response.status !== "success") {
  //       let errorMessage = `Upload failed. Status: ${response.status}`;
  //       try {
  //         const errorData = await response.json();
  //         errorMessage = errorData.message || errorMessage;
  //       } catch (e) {
  //         // Ignore if response is not JSON or other parsing error
  //       }
  //       throw new Error(errorMessage);
  //     }

  //     const result = await response.json();
  //     // Displaying the prediction from the API response
  //     // Adjust `result.prediction` based on the actual API response structure
  //     toast.success(
  //       `Scan uploaded successfully! Prediction: ${JSON.stringify(
  //         result.prediction || result
  //       )}`
  //     );
  //     setSelectedFile(null);
  //     const fileInput = document.getElementById("file-upload");
  //     if (fileInput) fileInput.value = "";
  //     // Optionally, you might want to re-fetch the scan history here
  //     // fetchRecentScans();
  //   } catch (error) {
  //     console.error("Upload failed:", error);
  //     toast.error(error.message || "Upload failed. Please try again.");
  //   } finally {
  //     setIsUploading(false);
  //   }
  // };

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
    } catch (error) {
      toast.error(error.message || "Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };
  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Successfully logged out");
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("Failed to log out");
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
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Scan History</h2>
            {isLoading ? (
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Date
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Status
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Result
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recentScans.map((scan) => (
                      <tr key={scan.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {scan.date}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            {scan.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              scan.result === "Normal"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {scan.result}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      case "overview":
      default:
        return (
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">
              Welcome back, {user?.name || "User"}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-indigo-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-indigo-800">
                  Total Scans
                </h3>
                <p className="text-3xl font-bold text-indigo-600">
                  {recentScans.length}
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-green-800">
                  Normal Results
                </h3>
                <p className="text-3xl font-bold text-green-600">
                  {
                    recentScans.filter((scan) => scan.result === "Normal")
                      .length
                  }
                </p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-red-800">
                  Abnormal Results
                </h3>
                <p className="text-3xl font-bold text-red-600">
                  {
                    recentScans.filter((scan) => scan.result === "Abnormal")
                      .length
                  }
                </p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Recent Activity
              </h3>
              {isLoading ? (
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentScans.slice(0, 3).map((scan) => (
                    <div
                      key={scan.id}
                      className="flex items-center justify-between border-b pb-3"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Scan #{scan.id}
                        </p>
                        <p className="text-sm text-gray-500">{scan.date}</p>
                      </div>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          scan.result === "Normal"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {scan.result}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Kidney Cancer Detection
          </h1>
        </div>

        {/* Main Navigation Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("overview")}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "overview"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("upload")}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "upload"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Upload Scan
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "history"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Scan History
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
