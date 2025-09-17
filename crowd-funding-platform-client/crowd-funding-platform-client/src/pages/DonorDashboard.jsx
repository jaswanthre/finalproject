import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./DonorDashboard.css";

function DonorDashboard() {
  const { user } = useAuth();
  const [donationTransactions, setDonationTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalDonations: 0,
    totalAmount: 0,
    recentCampaigns: []
  });
  const [recentDonations, setRecentDonations] = useState([]);

  const fetchDonations = async () => {
    if (!user?.email || !user?.token) return;
    setLoading(true);
    try {
      const res = await fetch(
        `http://localhost:5000/api/donors/donation/email/${user.email}`,
        {
          headers: {
            Authorization: `Bearer ${user.token}`
          }
        }
      );
      const data = await res.json();

      if (Array.isArray(data)) {
        const formatted = await Promise.all(
          data.map(async (d) => {
            try {
              const campaignRes = await fetch(
                `http://localhost:5000/api/campaigns/campaign/campaigns/${d.campaign_id}`
              );
              const campaign = await campaignRes.json();

              return {
                id: d.donation_id,
                campaignId: d.campaign_id,
                amount: Number(d.amount),
                date: d.created_at || new Date().toISOString(),
                status: d.payment_status || "pending",
                campaignTitle: campaign.title,
                campaignImage: campaign.campaign_image,
                ngoName: campaign.ngo_email,
                location: campaign.city,
                goalAmount: Number(campaign.target_amount) || 0,
                raisedAmount: Number(campaign.raised_amount) || 0,
                progressPercentage: campaign.target_amount
                  ? Math.round(
                      (Number(campaign.raised_amount) /
                        Number(campaign.target_amount)) *
                        100
                    )
                  : 0,
              };
            } catch {
              return {
                id: d.donation_id,
                campaignId: d.campaign_id,
                amount: Number(d.amount),
                date: d.created_at || new Date().toISOString(),
                status: d.payment_status || "pending",
                campaignTitle: d.campaign_title || "Campaign",
                campaignImage: d.campaign_image || "",
                ngoName: d.ngo_email || "NGO",
                location: d.city || "Online",
                goalAmount: Number(d.target_amount) || 0,
                raisedAmount: Number(d.raised_amount) || 0,
                progressPercentage: d.target_amount
                  ? Math.round(
                      (Number(d.raised_amount) / Number(d.target_amount)) *
                        100
                    )
                  : 0,
              };
            }
          })
        );
        setDonationTransactions(formatted);
      }
    } catch (err) {
      console.error("Error fetching donations:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonations();
  }, [user]);

  useEffect(() => {
    if (!loading) {
      const totalDonations = donationTransactions.length;
      const totalAmount = donationTransactions.reduce((sum, donation) => sum + donation.amount, 0);

      const uniqueCampaigns = Array.from(new Set(donationTransactions.map(d => d.campaignId)))
        .map(campaignId => {
          const donation = donationTransactions.find(d => d.campaignId === campaignId);
          return {
            id: campaignId,
            title: donation.campaignTitle,
            amount: donation.amount
          };
        });

      setStats({
        totalDonations,
        totalAmount,
        recentCampaigns: uniqueCampaigns
      });

      setRecentDonations(donationTransactions.slice(0, 3));
    }
  }, [donationTransactions, loading]);

  return (
    <div className="container donor-dashboard">
      <div className="dashboard-header">
        <div className="dashboard-header-content">
          <div className="dashboard-text">
            <h1 className="dashboard-title">Donor Dashboard</h1>
            <p className="dashboard-welcome">Welcome back! <span>{user.name}</span></p>
          </div>
          <div className="dashboard-image">
            <img src="https://www.thelifeyoucansave.org/wp-content/uploads/2019/11/Screen-Shot-2015-07-13-at-1.53.34-PM.png" alt="Effective Giving" />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loading-spinner">Loading...</div>
      ) : (
        <div className="dashboard-grid">
          <div className="card dashboard-card">
            <h2>Quick Links</h2>
            <div className="quick-links">
              <Link to="/my-profile" className="quick-link">👤 My Profile</Link>
              <Link to="/my-donations" className="quick-link">💰 My Donations</Link>
              <Link to="/d-campaigns" className="quick-link">🌍 Browse Campaigns</Link>
            </div>
          </div>

          <div className="card dashboard-card summary-card">
            <h2>Donation Summary</h2>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-value">{stats.totalDonations}</span>
                <span className="stat-label">Total Donations</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">₹{stats.totalAmount.toLocaleString()}</span>
                <span className="stat-label">Total Amount</span>
              </div>
            </div>
            <div className="dashboard-actions">
              <Link to="/my-donations" className="btn btn-primary view-all-btn">View All Donations</Link>
            </div>
          </div>

          <div className="card dashboard-card donations-preview-card">
            <h2>My Recent Donations</h2>
            {recentDonations.length > 0 ? (
              <div className="recent-donations-list">
                {recentDonations.map(donation => (
                  <div key={donation.id} className="recent-donation-item">
                    <div className="donation-campaign-image">
                      <img src={donation.campaignImage || "https://via.placeholder.com/150"} alt={donation.campaignTitle} />
                    </div>
                    <div className="donation-details">
                      <h3 className="donation-campaign-title">{donation.campaignTitle}</h3>
                      <div className="donation-meta">
                        <span className="donation-ngo">{donation.ngoName}</span>
                        <span className="donation-location">📍 {donation.location || 'Online'}</span>
                      </div>
                      <div className="donation-amount-date">
                        <span className="donation-amount">₹{donation.amount.toLocaleString()}</span>
                        <span className="donation-date">{new Date(donation.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                    {/* <Link to={`/d-campaigns/${donation.campaignId}`} className="btn btn-sm btn-outline">View Campaign</Link> */}
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-donations-message">You haven't made any donations yet.</p>
            )}
            <Link to="/my-donations" className="btn btn-primary view-all-btn">View All Donations</Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default DonorDashboard;
