import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./HeroSection.css";
import bgImage from "../assets/image.jpeg";

export default function HeroSection() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchCampaigns() {
      setLoading(true);
      try {
        const res = await fetch("http://localhost:5000/api/campaigns/campaign/campaigns");
        const data = await res.json();
        setCampaigns(data || []);
      } catch (err) {
        console.error("Error fetching campaigns", err);
      } finally {
        setLoading(false);
      }
    }
    fetchCampaigns();
  }, []);

  return (
    <>
      <section
        className="hero-container full-bg"
        style={{ backgroundImage: `url(${bgImage})` }}
      >
        <div className="overlay"></div>
        <div className="content-container">
          <div className="text-content">
            <p className="small-text">For Verified & Trusted NGOs</p>
            <h1 className="main-text">
              Empower <br />{" "}
              <span className="highlight">Change Makers</span>
            </h1>
            <p className="description">
              Join us in transforming lives through impactful campaigns and
              donations. Together, we build thriving communities.
            </p>
            <div className="button-group">
              <Link to="/signup" className="btn btn-primary">
                Get Started
              </Link>
              <Link to="/login" className="btn btn-secondary">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="campaigns-section">
        <h2>Explore Campaigns</h2>
        {loading && <p>Loading...</p>}
        <div className="campaign-list">
          {campaigns.length === 0 && !loading && (
            <p>No campaigns found at this time.</p>
          )}
          {campaigns.map((campaign) => {
            const percent =
              Math.round(
                (campaign.raised_amount / campaign.target_amount) * 100
              ) || 0;
            return (
              <div key={campaign.campaign_id} className="campaign-card">
                <img
                  className="campaign-image"
                  src={
                    campaign.campaign_image || "/assets/default_campaign.jpg"
                  }
                  alt={campaign.title}
                  loading="lazy"
                />
                <h3>{campaign.title}</h3>
                <p className="short-desc">
                  {campaign.description?.slice(0, 100)}
                  {campaign.description?.length > 100 ? "..." : ""}
                </p>
                <div className="campaign-info">
                  <span>₹{campaign.raised_amount.toLocaleString()} raised</span>
                  <span>{percent}% funded</span>
                </div>
                <div className="campaign-date">
                  <span>Start: {new Date(campaign.start_date).toLocaleDateString()}</span>
                  <span>End: {new Date(campaign.end_date).toLocaleDateString()}</span>
                </div>
                <Link to={`/campaigns/${campaign.campaign_id}`} className="btn btn-campaign">
                  View Details
                </Link>
              </div>
            );
          })}
        </div>
      </section>
      <footer className="site-footer">
        <p>© 2025 Crowd Fund. All Rights Reserved.</p>
      </footer>
    </>
  );
}
