import { useState } from "react";
import { useNavigate } from "react-router-dom";
import client, { donorServiceClient, campaignServiceClient } from "../api/client";
import mockAPI from "../api/mockService";
import "./DonationForm.css";
import { useWallet } from "../context/WalletContext";
import { useAuth } from "../context/AuthContext";

export default function DonationForm({ campaignId, campaignTitle, campaignImage, ngoName, goalAmount, raisedAmount, location }) {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const { balance: walletBalance, makeDonation } = useWallet();
  const { user } = useAuth();
  const navigate = useNavigate();



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
      // Use the makeDonation function from WalletContext with all campaign details
      const { newRaisedAmount, progressPercentage } = makeDonation(
        value, 
        campaignId, 
        campaignTitle, 
        campaignImage, 
        ngoName, 
        goalAmount, 
        raisedAmount,
        location
      );
      
      // Get user email from auth context
      const donor_email = user?.email || 'anonymous@example.com';
      
      try {
        // Use donor service endpoint to create donation
        const donationResponse = await donorServiceClient.post("/donation", { 
          campaign_id: campaignId, 
          donor_email,
          amount: value, 
          payment_method: 'wallet'
        });
        
        // Get donation ID from response
        const donationId = donationResponse.data?.donation_id || `don-${Date.now()}`;
        
        // Create transaction record
        await donorServiceClient.post("/transaction", {
          donation_id: donationId,
          transaction_amount: value,
          payment_gateway: 'wallet',
          transaction_status: 'completed'
        });
      } catch (error) {
        // If backend API fails, use mock API as fallback
        await mockAPI.makeDonation(campaignId, value, { 
          campaignTitle, 
          campaignImage, 
          ngoName, 
          location 
        });
      }
      
      setShowSuccess(true);
      setMsg("Thank you! Your donation has been successfully processed.");
      
      // Redirect to Donation Success page after 1.5 seconds with all campaign details
      setTimeout(() => {
        navigate("/donation-success", { 
          state: { 
            amount: value, 
            campaignTitle, 
            campaignImage, 
            ngoName,
            goalAmount,
            raisedAmount: newRaisedAmount,
            progressPercentage,
            location
          } 
        });
      }, 1500);
    } catch (err) {
      setMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (showSuccess) {
    return (
      <div className="donation-success">
        <div className="donation-success-icon">✅</div>
        <h3 className="donation-success-title">Donation Successful!</h3>
        <p className="donation-success-message">
          Thank you for your generous contribution of ₹{amount}. Your support makes a real difference!
        </p>
        <p className="donation-redirect-message">
          You will be redirected to your donations page in a moment...
        </p>
      </div>
    );
  }

  return (
    <form className="form donation-form" onSubmit={onSubmit}>
      <div className="wallet-info">
        <div className="wallet-balance">
          <span className="wallet-label">Wallet Balance:</span>
          <span className="wallet-amount">
            <>₹{walletBalance.toLocaleString()}</>
          </span>
        </div>
        <button 
          type="button" 
          className="btn btn-add-wallet" 
          onClick={() => navigate('/my-wallet')}
        >
          Add Money
        </button>
      </div>
      
      <div className="donation-amount-wrapper">
        <label className="donation-label">
          Donation Amount (₹)
          <input
            type="number"
            min="1"
            max={walletBalance}
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
        disabled={loading || Number(amount) > walletBalance}
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
