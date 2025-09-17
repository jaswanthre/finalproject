import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "../styles/VerifyNgo.css";
import "../styles/VerifyNgo.css"
export default function VerifyNgo() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [files, setFiles] = useState({
    ngo_registration_doc: null,
    pan_card: null,
    bank_proof: null,
    id_proof: null
  });
  const [status, setStatus] = useState("NONE");
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const fetchStatus = async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/api/users/verifications/${user.email}`,
          { headers: { Authorization: `Bearer ${user.token}` } }
        );
        if (res.status === 401) {
          setMsg("Session expired. Please log in again.");
          navigate("/login");
          return;
        }
        if (res.ok) {
          const data = await res.json();
          setStatus(data.verification.status || "NONE");
          setFeedback(data.verification.feedback || "");
        }
      } catch {
        setMsg("Unable to fetch verification status.");
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
  }, [user, navigate]);

  const handleFileChange = (e, key) => {
    const file = e.target.files[0];
    if (file && file.size > 5 * 1024 * 1024) {
      setMsg("File size exceeds 5MB");
      return;
    }
    setFiles((prev) => ({ ...prev, [key]: file }));
    setMsg("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!files.ngo_registration_doc || !files.pan_card || !files.bank_proof || !files.id_proof) {
      setMsg("Please upload all required documents.");
      return;
    }
    setIsSubmitting(true);
    setMsg("");
    try {
      const formData = new FormData();
      formData.append("email", user.email);
      for (const key in files) {
        if (files[key]) formData.append(key, files[key]);
      }

      const res = await fetch("http://localhost:5000/api/users/verifications", {
        method: "POST",
        headers: { Authorization: `Bearer ${user.token}` },
        body: formData
      });

      if (res.ok) {
        setStatus("PENDING");
        setMsg("Verification submitted successfully!");
      } else {
        setMsg("Failed to submit verification.");
      }
    } catch {
      setMsg("An error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="verify-ngo-container">
      <main className="verify-main">
        <div className="verify-title">
          <h1>NGO Verification</h1>
          <p>Upload required documents to verify NGO status and unlock campaign creation.</p>
        </div>

        {loading ? (
          <div className="loading-section">Loading verification status...</div>
        ) : status === "PENDING" ? (
          <div className="status-card pending">
            <h2>Verification in Progress</h2>
            <p>Your application is under review. Please wait for admin approval.</p>
          </div>
        ) : status === "APPROVED" ? (
          <div className="status-card approved">
            <h2>Verified Successfully</h2>
            <p>Your NGO is now verified. You can create campaigns and receive donations.</p>
          </div>
        ) : (
          <>
            {status === "REJECTED" && (
              <div className="status-card rejected">
                <h2>Verification Rejected</h2>
                <p>{feedback}</p>
              </div>
            )}
            <form className="verify-form" onSubmit={handleSubmit}>
              <div className="document-grid">
                <div className="document-card">
                  <h3>NGO Registration Certificate</h3>
                  <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => handleFileChange(e, "ngo_registration_doc")} />
                </div>
                <div className="document-card">
                  <h3>PAN Card</h3>
                  <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => handleFileChange(e, "pan_card")} />
                </div>
                <div className="document-card">
                  <h3>Bank Proof</h3>
                  <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => handleFileChange(e, "bank_proof")} />
                </div>
                <div className="document-card">
                  <h3>ID Proof</h3>
                  <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => handleFileChange(e, "id_proof")} />
                </div>
              </div>
              <button type="submit" className="submit-button" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit for Verification"}
              </button>
              {msg && <p className="form-message">{msg}</p>}
            </form>
          </>
        )}
      </main>
    </div>
  );
}
