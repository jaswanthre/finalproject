import React from "react";
import { useNavigate } from "react-router-dom";
import "./HeroSection.css";
import heroimage  from "../assets/Gemini_Generated_Image_mtb52omtb52omtb5.png"
const HeroSection = () => {
  const navigate = useNavigate();

  const handleViewCampaigns = () => {
    navigate("/campaigns"); // ✅ corrected route
  };

  return (
    <div className="hero-section">
      <div className="hero-overlay">
        <img src={heroimage} alt="" className="h1im"/>
      </div>
    </div>
  );
};

export default HeroSection;
