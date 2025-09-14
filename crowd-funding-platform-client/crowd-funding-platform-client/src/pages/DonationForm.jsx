
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
      
      const orderRes = await axios.post(
  "http://localhost:5000/api/donors/donation/order",
  {
    amount: Number(amount),
    currency: "INR",
    receipt: `receipt_${Date.now()}`,
    campaign_id: campaign.campaignId,
    donor_email: user.email,
    payment_method: paymentMethod,  // ✅ Include this
  },
  {
    headers: { Authorization: `Bearer ${user.token}` },
  }
);


      const { id: orderId, amount: orderAmount, currency } = orderRes.data;

      // 2. Initialize Razorpay checkout
      const options = {
       key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderAmount,
        currency: currency,
        name: "Crowd Funding Platform",
        description: `Donation for ${campaign.campaignTitle}`,
        order_id: orderId,
        handler: async function (response) {
          try {
            // 3. Verify payment
            const verifyRes = await axios.post(
              "http://localhost:5000/api/donors/donation/verify",
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                amount: Number(amount),
                campaign_id: campaign.campaignId,
                donor_email: user.email,
              },
              {
                headers: { Authorization: `Bearer ${user.token}` },
              }
            );

            setMsg("Donation successful! 🎉");
            setAmount("");
            setTimeout(() => navigate("/my-donations"), 2000);
          } catch (error) {
            setMsg("Payment verification failed.");
          }
        },
        prefill: {
          email: user.email,
        },
        theme: {
          color: "#3399cc",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (err) {
  console.error("Error creating order:", err);
  setMsg(err.response?.data?.error || err.message || "Something went wrong while creating the order.");
}
     finally {
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
          <p><strong>NGO:</strong> {campaign.ngoEmail}</p>
          <p><strong>City:</strong> {campaign.location}</p>
          <p><strong>Goal:</strong> ₹{Number(campaign.goalAmount).toLocaleString()}</p>
          <p><strong>Raised:</strong> ₹{Number(campaign.raisedAmount).toLocaleString()}</p>
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
