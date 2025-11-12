import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import UploadTabContent from "../components/dashboard/UploadTabContent"; // Import the new component
import PatientDataEntry from "../components/kidney_predictor";

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
  const [activeTab, setActiveTab] = useState("overview");
  const [recentScans, setRecentScans] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [prediction, setPrediction] = useState(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  const fetchRecentScans = async () => {
    try {
      // Fetch recent scans from API

      api.getDetections().then((res) => {
        setRecentScans(res?.data?.data?.detections);
      });
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching scans:", error);
      toast.error("Failed to load scan history");
      setIsLoading(false);
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
            <h2 className="text-xl font-semibold mb-4"> Patient Data Entry</h2>
            <PatientDataEntry fetchRecentScans={fetchRecentScans} />
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
                  Image Results
                </h3>
                <p className="text-3xl font-bold text-green-600">
                  {recentScans.filter((scan) => scan.image).length}
                </p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-red-800">
                  Medical Data Results
                </h3>
                <p className="text-3xl font-bold text-red-600">
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
              Upload Image
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "history"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Patient Data Entry
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
