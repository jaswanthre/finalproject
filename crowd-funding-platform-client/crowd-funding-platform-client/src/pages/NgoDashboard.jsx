import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/NgoDashboard.css";

function NgoDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalCampaigns: 0,
    activeCampaigns: 0,
    completedCampaigns: 0,
  });
  const [recentCampaigns, setRecentCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNgoData = async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/api/campaigns/campaign/campaigns/email/${user.email}`,
          { headers: { Authorization: `Bearer ${user.token}` } }
        );
        const data = await res.json();

        if (data.success && Array.isArray(data.campaigns)) {
          const totalCampaigns = data.campaigns.length;
          const totalRaised = data.campaigns.reduce(
            (sum, c) => sum + Number(c.raised_amount || 0),
            0
          );
          const activeCampaigns = data.campaigns.filter(
            (c) => c.status === "ACTIVE"
          ).length;

          setStats({ totalCampaigns, totalRaised, activeCampaigns });
          setRecentCampaigns(data.campaigns.slice(0, 3));
        }
      } catch (err) {
        console.error("Error fetching NGO dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    if (user?.email) fetchNgoData();
  }, [user]);

  return (
    <div className="container ngo-dashboard">
      {/* Header */}
      <div className="ngo-dashboard-header">
        <div>
          <h1 className="ngo-dashboard-title">NGO Dashboard</h1>
          <p className="ngo-dashboard-welcome">
            Welcome back, <span className="user-email">{user?.email}</span>!
          </p>
        </div>
        <div className="ngo-dashboard-image">
          <img
            src="https://img.freepik.com/free-vector/non-profit-organization-concept-illustration_114360-28124.jpg"
            alt="NGO work"
          />
        </div>
      </div>

      {loading ? (
        <div className="loading-spinner">Loading...</div>
      ) : (
        <div className="dashboard-grid">
          {/* Quick Links */}
          <div className="card dashboard-card">
            <h2>Quick Links</h2>
            <div className="quick-links">
              <Link to="/my-profile" className="quick-link">
                <span className="quick-link-icon">👤</span>
                <span className="quick-link-text">My Profile</span>
              </Link>
              <Link to="/my-campaigns" className="quick-link">
                <span className="quick-link-icon">📢</span>
                <span className="quick-link-text">My Campaigns</span>
              </Link>
              <Link to="/create-campaign" className="quick-link">
                <span className="quick-link-icon">➕</span>
                <span className="quick-link-text">Create Campaign</span>
              </Link>
            </div>
          </div>

          {/* Campaign Summary */}
          <div className="card dashboard-card summary-card">
            <h2>Campaign Summary</h2>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-value">{stats.totalCampaigns}</span>
                <span className="stat-label">Total Campaigns</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{stats.activeCampaigns}</span>
                <span className="stat-label">Active Campaigns</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{stats.completedCampaigns}</span>
                <span className="stat-label">Completed Campaigns</span>
              </div>
            </div>
            <div className="dashboard-actions">
              <Link to="/my-campaigns" className="btn btn-primary view-all-btn">
                View My Campaigns
              </Link>
            </div>
          </div>

          {/* Recent Campaigns */}
          <div className="card dashboard-card donations-preview-card">
            <h2>Recent Campaigns</h2>
            {recentCampaigns.length > 0 ? (
              <div className="recent-donations-list">
                {recentCampaigns.map((campaign) => (
                  <div
                    key={campaign.campaign_id}
                    className="recent-donation-item"
                  >
                    <div className="donation-campaign-image">
                      <img src={campaign.campaign_image} alt={campaign.title} />
                    </div>
                    <div className="donation-details">
                      <h3 className="donation-campaign-title">
                        {campaign.title}
                      </h3>
                      <div className="donation-meta">
                        <span className="donation-ngo">
                          {campaign.ngo_email}
                        </span>
                        <span className="donation-location">
                          📍 {campaign.city}
                        </span>
                      </div>
                      <div className="donation-amount-date">
                        <span className="donation-amount">
                          Target: ₹
                          {parseInt(campaign.target_amount).toLocaleString()}
                        </span>
                        <span className="donation-date">
                          {new Date(campaign.start_date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-donations-message">No campaigns created yet.</p>
            )}
            <Link to="/campaigns" className="btn btn-primary view-all-btn">
              View All Campaigns
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default NgoDashboard;
