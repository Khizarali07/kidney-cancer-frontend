import React, { useRef, useState } from "react";
import axios from "axios";
import Button from "./Button";
import LoadingSpinner from "./LoadingSpinner";

const FIELD_LABELS = {
  age: "Age (years)",
  bp: "Blood Pressure (mm/Hg)",
  sg: "Specific Gravity (e.g. 1.005)",
  al: "Albumin (0–5)",
  su: "Sugar (0–5)",
  rbc: "Red Blood Cells (normal/abnormal)",
  pc: "Pus Cell (normal/abnormal)",
  pcc: "Pus Cell Clumps (present/notpresent)",
  ba: "Bacteria (present/notpresent)",
  bgr: "Blood Glucose Random (mgs/dl)",
  bu: "Blood Urea (mgs/dl)",
  sc: "Serum Creatinine (mgs/dl)",
  sod: "Sodium (mEq/L)",
  pot: "Potassium (mEq/L)",
  hemo: "Hemoglobin (gms)",
  pcv: "Packed Cell Volume",
  wc: "White Blood Cell Count (cells/cumm)",
  rc: "Red Blood Cell Count (millions/cmm)",
  htn: "Hypertension (yes/no)",
  dm: "Diabetes Mellitus (yes/no)",
  cad: "Coronary Artery Disease (yes/no)",
  appet: "Appetite (good/poor)",
  pe: "Pedal Edema (yes/no)",
  ane: "Anemia (yes/no)",
};

const PatientDataEntry = ({ fetchRecentScans }) => {
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState(
    Object.keys(FIELD_LABELS).reduce((o, k) => ({ ...o, [k]: "" }), {})
  );
  const [trainingStatus, setTrainingStatus] = useState("");
  const [trainingLoading, setTrainingLoading] = useState(false);
  const [formFieldsLoaded, setFormFieldsLoaded] = useState(false);
  const [serverColumns, setServerColumns] = useState(null);
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [predictionResult, setPredictionResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleTrainUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);
    setTrainingLoading(true);
    setTrainingStatus("Training dataset... This may take a moment.");
    setServerColumns(null);

    const data = new FormData();
    data.append("file", file);
    try {
      const res = await axios.post(
        `${process.env.REACT_APP_FLASK_API_URL}/train`,
        data
      );
      console.log(res);

      setTrainingStatus(res.data?.message || "Model trained successfully");
      setFormFieldsLoaded(true);

      if (Array.isArray(res.data?.columns) && res.data.columns.length > 0) {
        setServerColumns(res.data.columns);
      }
    } catch (err) {
      console.error(err.response?.data || err.message);
      setTrainingStatus(
        "Training failed: " + (err.response?.data?.error || err.message)
      );
      setFormFieldsLoaded(false);
    } finally {
      setTrainingLoading(false);
      // allow uploading the same file again
      if (e?.target) e.target.value = "";
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(
        `${process.env.REACT_APP_FLASK_API_URL}/predict`,
        formData
      );
      setPredictionResult(res.data);
      const save = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/detection/save-prediction`,
        { formData, ...res.data },
        {
          withCredentials: true,
        }
      );

      console.log(save);
      fetchRecentScans();
    } catch (err) {
      console.error(err.response?.data || err.message);
      alert("Prediction failed: " + (err.response?.data.error || err.message));
    }
    setLoading(false);
  };

  const inputStyle = "border p-2 rounded w-full";

  return (
    <div className="max-w-5xl mx-auto mt-6 sm:mt-10 bg-white shadow p-4 sm:p-8 rounded-xl">
      <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6">
        Kidney Disease Trainer & Predictor
      </h1>

      <div className="mb-8">
        <div className="border border-gray-200 rounded-lg p-4 sm:p-6 bg-gray-50">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-gray-900">
                Upload Dataset (CSV)
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Upload your kidney disease dataset to train the model.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleTrainUpload}
                className="hidden"
                disabled={trainingLoading}
              />
              <Button
                variant="primary"
                onClick={() => fileInputRef.current?.click()}
                loading={trainingLoading}
                disabled={trainingLoading}
              >
                {trainingLoading ? "Training" : "Upload Dataset"}
              </Button>
            </div>
          </div>

          {(uploadedFileName || trainingStatus) && (
            <div className="mt-4">
              {uploadedFileName && (
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Selected:</span> {uploadedFileName}
                </p>
              )}

              {trainingLoading && (
                <div className="mt-3 flex items-center gap-3 rounded-md border border-indigo-200 bg-white p-3">
                  <LoadingSpinner size="sm" />
                  <div className="text-sm text-gray-700">
                    <div className="font-medium">Training in progress</div>
                    <div className="text-gray-600">Please wait…</div>
                  </div>
                </div>
              )}

              {!trainingLoading && trainingStatus && (
                <p
                  className={`mt-2 text-sm ${
                    trainingStatus.toLowerCase().includes("failed")
                      ? "text-red-600"
                      : "text-green-600"
                  }`}
                >
                  {trainingStatus}
                </p>
              )}

              {!trainingLoading && Array.isArray(serverColumns) && (
                <p className="mt-2 text-xs text-gray-600">
                  Columns detected: {serverColumns.length}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {formFieldsLoaded && (
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {Object.entries(FIELD_LABELS).map(([key, label]) => (
            <div key={key}>
              <label className="block text-sm font-semibold mb-1">
                {label}
              </label>
              <input
                type="text"
                name={key}
                value={formData[key]}
                onChange={handleChange}
                className={inputStyle}
                required
              />
            </div>
          ))}
          <div className="md:col-span-2 text-center">
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700"
              disabled={loading}
            >
              {loading ? "Predicting..." : "Predict"}
            </button>
          </div>
        </form>
      )}

      {predictionResult && (
        <div className="mt-6 p-4 bg-gray-100 rounded">
          <p className="text-lg">
            <strong>Prediction:</strong>{" "}
            {predictionResult.prediction.toUpperCase()}
          </p>
          <p>
            <strong>Probability:</strong>{" "}
            {(predictionResult.probability * 100).toFixed(2)}%
          </p>
          <div className="mt-4">
            <p className="font-semibold">Confusion Matrix:</p>
            <div className="overflow-x-auto">
              <table className="table-auto border-collapse border border-gray-400 mt-2">
                <thead>
                  <tr>
                    <th className="border border-gray-400 px-4 py-2 bg-gray-200"></th>
                    <th className="border border-gray-400 px-4 py-2 bg-gray-200">
                      Predicted: Not CKD
                    </th>
                    <th className="border border-gray-400 px-4 py-2 bg-gray-200">
                      Predicted: CKD
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-400 px-4 py-2 bg-gray-100 font-medium">
                      Actual: Not CKD
                    </td>
                    <td className="border border-gray-400 px-4 py-2">
                      {predictionResult.confusion_matrix[0][0]}
                    </td>
                    <td className="border border-gray-400 px-4 py-2">
                      {predictionResult.confusion_matrix[0][1]}
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-400 px-4 py-2 bg-gray-100 font-medium">
                      Actual: CKD
                    </td>
                    <td className="border border-gray-400 px-4 py-2">
                      {predictionResult.confusion_matrix[1][0]}
                    </td>
                    <td className="border border-gray-400 px-4 py-2">
                      {predictionResult.confusion_matrix[1][1]}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <p>
            <strong>Precision:</strong> {predictionResult.precision}
          </p>
          <p>
            <strong>Recall:</strong> {predictionResult.recall}
          </p>
        </div>
      )}
    </div>
  );
};

export default PatientDataEntry;
