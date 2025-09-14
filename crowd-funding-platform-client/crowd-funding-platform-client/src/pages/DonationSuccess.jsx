import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useWallet } from "../context/WalletContext";
import "../styles/DonationSuccess.css";
import { FaCheckCircle, FaArrowRight, FaHeart } from "react-icons/fa";

export default function DonationSuccess() {
  const [countdown, setCountdown] = useState(5);
  const navigate = useNavigate();
  const location = useLocation();
  const { getStatistics } = useWallet();
  
  // Get the donation amount and campaign details from the location state
  const { 
    amount, 
    campaignTitle, 
    campaignImage, 
    ngoName,
    goalAmount,
    raisedAmount,
    progressPercentage
  } = location.state || { 
    amount: '0', 
    campaignTitle: 'this campaign',
    campaignImage: "",
    ngoName: "Organization",
    goalAmount: 0,
    raisedAmount: 0,
    progressPercentage: 0
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/donor');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);
  
  // Get wallet statistics
  const stats = getStatistics();

  const motivationalQuotes = [
    "Your generosity will create ripples of change that extend far beyond what you can see.",
    "In a world where you can be anything, you chose to be kind. Thank you!",
    "Small acts, when multiplied by millions of people, can transform the world.",
    "The best way to find yourself is to lose yourself in the service of others.",
    "No one has ever become poor by giving.",
    "Giving is not just about making a donation. It's about making a difference.",
    "We make a living by what we get, but we make a life by what we give.",
    "Alone we can do so little; together we can do so much.",
    "The meaning of life is to find your gift. The purpose of life is to give it away.",
    "Giving is the greatest act of grace."
  ];

  // Select a random motivational quote
  const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];

  return (
    <div className="donation-success-page">
      <div className="donation-success-container">
        <div className="donation-success-icon">
          <FaHeart className="heart-icon" />
          <FaCheckCircle className="check-icon" />
        </div>
        
        <h1 className="donation-success-title">Thank You for Your Donation!</h1>
        
        <div className="donation-success-details">
          <div className="donation-success-amount">₹{amount}</div>
          <div className="donation-success-campaign">to {campaignTitle}</div>
          {ngoName && <div className="donation-success-ngo">Supporting: {ngoName}</div>}
        </div>
        
        {campaignImage && (
          <div className="donation-success-image-container">
            <img 
              src={campaignImage} 
              alt={campaignTitle} 
              className="donation-success-image" 
            />
          </div>
        )}
        
        {goalAmount > 0 && (
          <div className="donation-success-progress">
            <div className="progress-label">
              <span>Progress: ₹{raisedAmount} of ₹{goalAmount}</span>
              <span>{progressPercentage}%</span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-bar-fill" 
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>
        )}
        
        <div className="donation-success-message">
          <p>Your contribution has been successfully processed and will make a real difference.</p>
          {stats && <p>You have now supported {stats.campaignsSupported} campaigns with a total of ₹{stats.totalDonated}.</p>}
          <div className="quote-container">
            <p className="motivational-quote">"{randomQuote}"</p>
            <div className="quote-decoration"></div>
          </div>
        </div>
        
        <div className="donation-success-redirect">
          <p>You will be redirected to your dashboard in <span className="countdown">{countdown}</span> seconds...</p>
        </div>
        
        <div className="donation-success-actions">
          <button className="btn btn-primary" onClick={() => navigate('/donor-dashboard')}>Go to Dashboard</button>
          <button className="btn btn-outline" onClick={() => navigate('/campaigns')}>Explore More Campaigns</button>
        </div>
      </div>
    </div>
  );
}