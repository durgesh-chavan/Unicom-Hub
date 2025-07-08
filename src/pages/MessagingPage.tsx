import React, { useState } from "react";
import axios from "axios";

const integrations = [
  { value: "whatsapp", label: "WhatsApp", endpoint: "/send-bulk-whatsapp" },
  { value: "email", label: "Email", endpoint: "/send-bulk-email" },
  { value: "sms", label: "SMS", endpoint: "/send-bulk-sms" },
];

export default function MessagingPage() {
  const [selectedIntegration, setSelectedIntegration] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [emailCredentials, setEmailCredentials] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [responseMessage, setResponseMessage] = useState("");
  const [sendResults, setSendResults] = useState({
    totalProcessed: 0,
    successCount: 0,
    errorCount: 0,
    details: {
      successful: [],
      failed: []
    }
  });
  const [showResults, setShowResults] = useState(false);
  const [useSameMessage, setUseSameMessage] = useState(false);
  const [commonMessage, setCommonMessage] = useState("");

  const handleIntegrationChange = (e) => {
    setSelectedIntegration(e.target.value);
    setError("");
    setResponseMessage("");
  };

  const handleFileChange = (e) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
      setError("");
    }
  };

  const handleEmailCredentialsChange = (e) => {
    setEmailCredentials({ ...emailCredentials, [e.target.name]: e.target.value });
  };

  const downloadTemplate = () => {
    let csvContent = "";
    let filename = "";

    switch (selectedIntegration) {
      case "email":
        csvContent = "email,subject,message\nexample@email.com,Hello Subject,Your message content here";
        filename = "email-template.csv";
        break;
      case "whatsapp":
      case "sms":
        csvContent = "phoneNumber,message\n+1234567890,Your message content here";
        filename = `${selectedIntegration}-template.csv`;
        break;
      default:
        return;
    }

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const userId = localStorage.getItem("userId");
  const [whatsappStatus, setWhatsappStatus] = useState("NOT_INITIALIZED");

  const initializeWhatsApp = async () => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_API_URL}/messaging/init-whatsapp`
      );
      setWhatsappStatus("AWAITING_AUTH");
      
      const checkAuth = setInterval(async () => {
        const statusRes = await axios.get(
          `${import.meta.env.VITE_BACKEND_API_URL}/messaging/check-whatsapp-auth`
        );
        
        if (statusRes.data.status === "AUTHORIZED") {
          setWhatsappStatus("AUTHORIZED");
          clearInterval(checkAuth);
        }
      }, 2000);
      
    } catch (error) {
      setError("Failed to initialize WhatsApp");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResponseMessage("");
    setShowResults(false);

    if (!selectedIntegration) {
      setError("Please select an integration");
      setLoading(false);
      return;
    }

    if (!file) {
      setError("Please upload a CSV file");
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("userId", userId);
    formData.append("useSameMessage", useSameMessage);
    formData.append("message", commonMessage);

    if (selectedIntegration === "email") {
      formData.append("senderEmail", emailCredentials.email);
      formData.append("senderPassword", emailCredentials.password);
    }

    const endpoint = integrations.find((i) => i.value === selectedIntegration)?.endpoint;

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_API_URL}/messaging${endpoint}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (response.data.success) {
        if (selectedIntegration === "whatsapp") {
          setSendResults({
            totalProcessed: response.data.totalProcessed,
            successCount: response.data.successCount,
            errorCount: response.data.errorCount,
            details: {
              successful: response.data.results,
              failed: response.data.errors
            }
          });
        } else {
          setSendResults({
            totalProcessed: response.data.sent.length + response.data.failed.length,
            successCount: response.data.sent.length,
            errorCount: response.data.failed.length,
            details: {
              successful: response.data.sent,
              failed: response.data.failed
            }
          });
        }
        setShowResults(true);
        setResponseMessage("Messages sent successfully!");
      }
    } catch (error) {
      setError("An error occurred while sending messages");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-blue-100 flex items-center justify-center">
      <div className="bg-white p-10 rounded-xl shadow-lg w-full max-w-lg">
        <h1 className="text-3xl font-bold text-blue-800 mb-6 text-center">UniCom Hub</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-lg font-medium text-blue-700">Select Integration</label>
            <select
              value={selectedIntegration}
              onChange={handleIntegrationChange}
              className="mt-2 w-full p-3 text-lg rounded-lg border-gray-300 focus:ring-blue-500"
            >
              <option value="">Choose an integration</option>
              {integrations.map((integration) => (
                <option key={integration.value} value={integration.value}>
                  {integration.label}
                </option>
              ))}
            </select>
          </div>

    <div className="p-4 border rounded-lg bg-white shadow-md text-center">
      <label className="block text-lg font-medium text-blue-700">Upload CSV</label>
      
      {/* Hidden file input */}
      <input
        type="file"
        accept=".csv"
        id="file-upload"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Custom Upload Button */}
      <label
        htmlFor="file-upload"
        className="mt-3 inline-block cursor-pointer rounded-lg bg-blue-600 px-6 py-3 text-white font-semibold shadow-md hover:bg-blue-700 transition duration-200"
      >
        Choose File
      </label>

      {/* Show file name and checkmark if a file is selected */}
      {file && (
        <div className="mt-3 flex items-center justify-center gap-2 text-green-600 text-lg font-semibold">
          ✅ <span>{file.name}</span>
        </div>
      )}

      {/* Show error if any */}
      {error && <p className="mt-2 text-red-500">{error}</p>}
    </div>

          {selectedIntegration && (
            <button
              type="button"
              onClick={downloadTemplate}
              className="w-full bg-gray-200 text-blue-600 py-3 rounded-lg hover:bg-gray-300"
            >
              Download CSV Template
            </button>
          )}

          <div>
            <label className="block text-lg font-medium text-blue-700">
              <input
                type="checkbox"
                checked={useSameMessage}
                onChange={(e) => setUseSameMessage(e.target.checked)}
                className="mr-2"
              />
              Use the same message for all recipients
            </label>
            {useSameMessage && (
              <textarea
                value={commonMessage}
                onChange={(e) => setCommonMessage(e.target.value)}
                placeholder="Enter your common message here"
                className="mt-2 w-full p-3 text-lg rounded-lg border-gray-300"
              />
            )}
          </div>

          {selectedIntegration === "email" && (
            <div className="space-y-4">
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={emailCredentials.email}
                onChange={handleEmailCredentialsChange}
                className="w-full p-3 text-lg rounded-lg border-gray-300"
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={emailCredentials.password}
                onChange={handleEmailCredentialsChange}
                className="w-full p-3 text-lg rounded-lg border-gray-300"
              />
            </div>
          )}

          {selectedIntegration === "whatsapp" && (
            <div className="space-y-4">
              {whatsappStatus === "NOT_INITIALIZED" && (
                <button
                  type="button"
                  onClick={initializeWhatsApp}
                  className="w-full bg-green-600 text-white py-3 rounded-lg"
                >
                  Initialize WhatsApp
                </button>
              )}
              
              {whatsappStatus === "AWAITING_AUTH" && (
                <div className="text-center p-4 bg-yellow-100 rounded-lg">
                  <p>Please scan the QR code in the WhatsApp window to continue</p>
                </div>
              )}
              
              {whatsappStatus === "AUTHORIZED" && (
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg"
                >
                  {loading ? "Sending..." : "Send Messages"}
                </button>
              )}
            </div>
          )}

          {error && <p className="text-red-500 text-lg text-center">{error}</p>}
          {responseMessage && <p className="text-green-500 text-lg text-center">{responseMessage}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 text-lg rounded-lg hover:bg-blue-700"
          >
            {loading ? "Sending..." : "Send Messages"}
          </button>
        </form>
      </div>
    </div>
  );
}