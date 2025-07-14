import React, { useState } from "react";
import axios from "axios";

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

const PatientDataEntry = () => {
  const [formData, setFormData] = useState(
    Object.keys(FIELD_LABELS).reduce((o, k) => ({ ...o, [k]: "" }), {})
  );
  const [trainingStatus, setTrainingStatus] = useState("");
  const [formFieldsLoaded, setFormFieldsLoaded] = useState(false);
  const [predictionResult, setPredictionResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleTrainUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const data = new FormData();
    data.append("file", file);
    try {
      const res = await axios.post("http://localhost:8001/train", data);
      console.log(res);

      setTrainingStatus(res.data.message);
      setFormFieldsLoaded(true);
      alert("Server columns: " + res.data.columns.join(", "));
    } catch (err) {
      console.error(err.response?.data || err.message);
      alert("Training failed: " + (err.response?.data.error || err.message));
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
      const res = await axios.post("http://localhost:8001/predict", formData);
      setPredictionResult(res.data);
      const save = await axios.post(
        "http://localhost:5000/api/v1/detection/save-prediction",
        { formData, ...res.data },
        {
          withCredentials: true,
        }
      );

      console.log(save);
    } catch (err) {
      console.error(err.response?.data || err.message);
      alert("Prediction failed: " + (err.response?.data.error || err.message));
    }
    setLoading(false);
  };

  const inputStyle = "border p-2 rounded w-full";

  return (
    <div className="max-w-5xl mx-auto mt-10 bg-white shadow p-8 rounded-xl">
      <h1 className="text-3xl font-bold text-center mb-6">
        Kidney Disease Trainer & Predictor
      </h1>

      <div className="mb-8 text-center">
        <input type="file" accept=".csv" onChange={handleTrainUpload} />
        {trainingStatus && (
          <p className="mt-2 text-green-600">{trainingStatus}</p>
        )}
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
