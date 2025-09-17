// CreateCampaign.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

export default function CreateCampaign() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [form, setForm] = useState({
    title: "",
    description: "",
    target_amount: "",
    start_date: "",
    end_date: "",
    city: "",
    campaign_image: null,
  });
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    setSuccess(false);

    if (
      !form.title ||
      !form.description ||
      !form.target_amount ||
      !form.start_date ||
      !form.end_date
    ) {
      setMsg("Please fill all required fields.");
      return;
    }

    if (Number(form.target_amount) <= 0) {
      setMsg("Goal must be greater than 0.");
      return;
    }

    setLoading(true);
    try {
      const data = new FormData();
      data.append("ngo_email", user.email);
      data.append("title", form.title);
      data.append("description", form.description);
      data.append("target_amount", form.target_amount);
      data.append("start_date", form.start_date);
      data.append("end_date", form.end_date);
      if (form.city) data.append("city", form.city);
      if (form.campaign_image)
        data.append("campaign_image", form.campaign_image);

      const res = await axios.post(
        "http://localhost:5000/api/campaigns/campaign/campaigns",
        data,
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (res.data) {
        setSuccess(true);
        setMsg("Campaign created successfully!");
        setForm({
          title: "",
          description: "",
          target_amount: "",
          start_date: "",
          end_date: "",
          city: "",
          campaign_image: null,
        });
      }
    } catch (err) {
      setMsg(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-campaign-wrapper">
      <form className="create-campaign-form" onSubmit={onSubmit}>
        <h1>Create Campaign</h1>
        <p className="form-subtitle">Start a new fundraising campaign</p>

        <label>
          Campaign Title
          <input
            type="text"
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
            required
          />
        </label>

        <label>
          Description
          <textarea
            rows="4"
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            required
          />
        </label>

        <label>
          Goal Amount (₹)
          <input
            type="number"
            min="1"
            value={form.target_amount}
            onChange={(e) => update("target_amount", e.target.value)}
            required
          />
        </label>

        <label>
          City
          <input
            type="text"
            value={form.city}
            onChange={(e) => update("city", e.target.value)}
          />
        </label>

        <div className="date-row">
          <label>
            Start Date
            <input
              type="date"
              value={form.start_date}
              onChange={(e) => update("start_date", e.target.value)}
              required
            />
          </label>
          <label>
            End Date
            <input
              type="date"
              value={form.end_date}
              onChange={(e) => update("end_date", e.target.value)}
              required
            />
          </label>
        </div>

        <label>
          Campaign Image
          <input
            type="file"
            accept="image/*"
            onChange={(e) => update("campaign_image", e.target.files[0])}
          />
        </label>

        <button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create Campaign"}
        </button>

        {msg && !success && <p className="error-msg">{msg}</p>}
        {success && (
          <div className="success-box">
            ✅ {msg} <br />
            <Link to="/my-campaigns" className="btn-green">
              View My Campaigns
            </Link>
          </div>
        )}
      </form>

      {/* === Responsive CSS with gradient background === */}
      <style jsx="true">{`
        .create-campaign-wrapper {
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 2rem 1rem;
          min-height: 100vh;
          background: linear-gradient(
            135deg,
            #0f172a 0%,
            #1e293b 50%,
            #334155 100%
          );
          background-attachment: fixed;
        }
        .create-campaign-form {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.15);
          padding: 2rem;
          border-radius: 16px;
          max-width: 600px;
          width: 100%;
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
          display: flex;
          flex-direction: column;
          gap: 1.2rem;
        }
        .create-campaign-form h1 {
          font-size: 2rem;
          text-align: center;
          margin-bottom: 0.5rem;
          color: #fff;
          background: linear-gradient(90deg, #60a5fa, #3b82f6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .form-subtitle {
          text-align: center;
          color: #cbd5e1;
          margin-bottom: 1rem;
        }
        label {
          font-weight: 600;
          color: #e2e8f0;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        input,
        textarea {
          padding: 0.75rem;
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 10px;
          font-size: 1rem;
          width: 100%;
          background: rgba(255, 255, 255, 0.08);
          color: #f8fafc;
        }
        input:focus,
        textarea:focus {
          border-color: #38bdf8;
          outline: none;
          box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.4);
        }
        .date-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }
        button {
          background: linear-gradient(90deg, #f97316, #fb923c);
          border: none;
          padding: 0.9rem;
          color: #fff;
          font-size: 1rem;
          font-weight: 600;
          border-radius: 8px;
          cursor: pointer;
          transition: 0.3s ease;
        }
        button:hover {
          transform: translateY(-2px);
          background: linear-gradient(90deg, #ea580c, #f97316);
        }
        .error-msg {
          color: #fca5a5;
          background: rgba(239, 68, 68, 0.15);
          padding: 0.75rem;
          border-radius: 6px;
          font-size: 0.95rem;
          text-align: center;
        }
        .success-box {
          background: rgba(16, 185, 129, 0.15);
          border: 1px solid #10b981;
          padding: 1rem;
          border-radius: 8px;
          text-align: center;
          color: #d1fae5;
          font-weight: 600;
        }
        .btn-green {
          display: inline-block;
          margin-top: 0.5rem;
          padding: 0.6rem 1.2rem;
          background: #10b981;
          color: white;
          border-radius: 6px;
          text-decoration: none;
          font-weight: 600;
          transition: 0.2s ease;
        }
        .btn-green:hover {
          background: #059669;
        }

        /* Mobile responsiveness */
        @media (max-width: 640px) {
          .create-campaign-form {
            padding: 1.5rem;
          }
          .date-row {
            grid-template-columns: 1fr;
          }
          .create-campaign-form h1 {
            font-size: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
}
