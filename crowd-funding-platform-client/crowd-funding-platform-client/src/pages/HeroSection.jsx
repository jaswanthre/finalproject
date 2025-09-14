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

    </div>
  );
};

export default HeroSection;
