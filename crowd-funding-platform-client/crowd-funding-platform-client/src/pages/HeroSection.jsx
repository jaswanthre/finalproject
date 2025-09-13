import React from "react";
import { useNavigate } from "react-router-dom";
import "./HeroSection.css";

const HeroSection = () => {
  const navigate = useNavigate();

  const handleViewCampaigns = () => {
    navigate("/campaigns"); // ✅ corrected route
  };

  return (
    <div className="hero-section">
      <div className="hero-overlay">
        <h1 className="hero-title">Welcome, Donor!</h1>
        <p className="hero-text">
          Explore campaigns and make a difference with your contribution.
        </p>
        <button className="hero-button" onClick={handleViewCampaigns}>
          View Campaigns
        </button>
      </div>
    </div>
  );
};

export default HeroSection;
