import { useState } from "react";
import client from "../api/client";

export default function DonationForm({ campaignId }) {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    const value = Number(amount);
    if (Number.isNaN(value) || value < 1) {
      setMsg("Please enter at least ₹1.");
      return;
    }
    setLoading(true);
    try {
      // Replace with your real donations endpoint when ready:
      // const res = await client.post("/api/donations", { campaignId, amount: value });
      // For now, simulate success:
      await new Promise((r) => setTimeout(r, 700));
      setMsg("Thank you! Donation submitted.");
      setAmount("");
    } catch (err) {
      setMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="form donation-form" onSubmit={onSubmit}>
      <div className="donation-amount-wrapper">
        <label className="donation-label">
          Amount (₹)
          <input
            type="number"
            min="1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
            required
            className="donation-input"
          />
        </label>
      </div>
      
      <button 
        className="btn btn-donate" 
        disabled={loading}
      >
        {loading ? (
          <span className="loading-spinner">Processing...</span>
        ) : (
          <>Donate Now</>
        )}
      </button>
      
      {msg && <p className={`form-msg ${msg.includes("Thank you") ? "success" : "error"}`}>{msg}</p>}
    </form>
  );
}
