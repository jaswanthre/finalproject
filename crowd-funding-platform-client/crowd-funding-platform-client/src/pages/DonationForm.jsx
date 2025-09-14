import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import "../styles/DonationForm.css";

export default function DonationForm() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const campaign = location.state;
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Credit Card");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");

    try {
      const body = {
        campaign_id: campaign.campaignId,
        donor_email: user.email,
        amount: Number(amount),
        payment_method: paymentMethod,
      };

      const res = await axios.post(
        "http://localhost:5000/api/donors/donation",
        body,
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );

      setMsg("Donation successful! 🎉");
      setAmount("");
      setTimeout(() => navigate("/my-donations"), 2000);
    } catch (err) {
      setMsg(err.response?.data?.error || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="donation-form-container">
      <div className="campaign-preview">
        <img
          src={campaign.campaignImage || "https://via.placeholder.com/600x400"}
          alt={campaign.campaignTitle}
        />
        <div>
          <h2>{campaign.campaignTitle}</h2>
          <p>
            <strong>NGO:</strong> {campaign.ngoEmail}
          </p>
          <p>
            <strong>City:</strong> {campaign.location}
          </p>
          <p>
            <strong>Goal:</strong> ₹
            {Number(campaign.goalAmount).toLocaleString()}
          </p>
          <p>
            <strong>Raised:</strong> ₹
            {Number(campaign.raisedAmount).toLocaleString()}
          </p>
        </div>
      </div>

      <form className="donation-form" onSubmit={handleSubmit}>
        <h3>Make a Donation</h3>

        {msg && <p className="message">{msg}</p>}

        <label>
          Amount (₹)
          <input
            type="number"
            min="1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </label>

        <label>
          Payment Method
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
          >
            <option>Credit Card</option>
            <option>Debit Card</option>
            <option>UPI</option>
            <option>Net Banking</option>
          </select>
        </label>

        <button type="submit" className="btn" disabled={loading}>
          {loading ? "Processing..." : "Donate Now"}
        </button>
      </form>
    </div>
  );
}
