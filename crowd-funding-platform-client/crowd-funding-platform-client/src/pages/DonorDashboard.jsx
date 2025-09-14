import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useWallet } from "../context/WalletContext";
import "./DonorDashboard.css";

function DonorDashboard() {
  const { user } = useAuth();
  const { getDonationTransactions } = useWallet();
  const [stats, setStats] = useState({
    totalDonations: 0,
    totalAmount: 0,
    recentCampaigns: []
  });
  const [recentDonations, setRecentDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Get real donation data from WalletContext
        const donationTransactions = getDonationTransactions();
        
        if (donationTransactions.length === 0) {
          setStats({
            totalDonations: 0,
            totalAmount: 0,
            recentCampaigns: []
          });
          setRecentDonations([]);
        } else {
          // Calculate stats from real data
          const totalDonations = donationTransactions.length;
          const totalAmount = donationTransactions.reduce((sum, donation) => sum + donation.amount, 0);
          
          // Get unique campaigns
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
          
          // Get recent donations (up to 3)
          setRecentDonations(donationTransactions.slice(0, 3));
        }
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [getDonationTransactions]);

  return (
    <div className="container donor-dashboard">
      <div className="dashboard-header">
        <div className="dashboard-header-content">
          <div className="dashboard-text">
            <h1 className="dashboard-title">Donor Dashboard</h1>
            <p className="dashboard-welcome">Welcome back, <span className="user-name">{user?.name || "Donor"}</span>!</p>
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
              <Link to="/profile" className="quick-link">
                <span className="quick-link-icon">👤</span>
                <span className="quick-link-text">My Profile</span>
              </Link>
              <Link to="/my-donations" className="quick-link">
                <span className="quick-link-icon">💰</span>
                <span className="quick-link-text">My Donations</span>
              </Link>
              <Link to="/campaigns" className="quick-link">
                <span className="quick-link-icon">🌍</span>
                <span className="quick-link-text">Browse Campaigns</span>
              </Link>
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
                      <img src={donation.image || donation.campaignImage} alt={donation.campaignTitle} />
                    </div>
                    <div className="donation-details">
                      <h3 className="donation-campaign-title">{donation.campaignTitle}</h3>
                      <div className="donation-meta">
                        <span className="donation-ngo">{donation.ngoName}</span>
                        <span className="donation-location">📍 {donation.location || 'Online'}</span>
                      </div>
                      <div className="donation-amount-date">
                        <span className="donation-amount">₹{donation.amount.toLocaleString()}</span>
                        <span className="donation-date">{donation.date}</span>
                      </div>
                    </div>
                    <Link to={`/campaigns/${donation.campaignId}`} className="btn btn-sm btn-outline">
                      View Campaign
                    </Link>
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
