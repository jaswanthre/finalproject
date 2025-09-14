import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import "./MyDonations.css";

export default function MyDonations() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [donations, setDonations] = useState([]);

  useEffect(() => {
    const fetchDonations = async () => {
      setLoading(true);
      try {
        if (user?.email) {
          // fetch user donations
          const res = await fetch(
            `http://localhost:5000/api/donors/donation/email/${user.email}`,
            { headers: { Authorization: `Bearer ${user.token}` } }
          );
          const data = await res.json();

          if (Array.isArray(data)) {
            // fetch latest campaign details for each donation
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
                  // fallback if campaign API fails
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
            setDonations(formatted);
          }
        }
      } catch (err) {
        console.error("Error fetching donations:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDonations();
  }, [user]);

  if (!user) {
    return (
      <div className="container donations-container">
        <div className="card donations-card">
          <h2>My Donations</h2>
          <p>Please log in to view your donations.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container donations-container">
      <div className="card donations-card">
        <div className="donations-header-title">
          <h2>My Donations</h2>
          <p className="donations-subtitle">Your contribution history</p>
        </div>

        <div className="donations-image-container">
          <img
            src="https://images.unsplash.com/photo-1532629345422-7515f3d16bb6"
            alt="Donations"
            className="donations-header-image"
          />
        </div>

        {loading ? (
          <div className="loading-spinner">Loading...</div>
        ) : donations.length === 0 ? (
          <p className="no-donations">You haven't made any donations yet.</p>
        ) : (
          <div className="donations-list">
            {donations.map((d) => (
              <div key={d.id} className="donation-card">
                <div className="donation-image">
                  <img
                    src={d.campaignImage || "https://via.placeholder.com/300"}
                    alt={d.campaignTitle}
                  />
                  {d.progressPercentage >= 100 && (
                    <div className="campaign-completed-badge">
                      Campaign Completed
                    </div>
                  )}
                </div>
                <div className="donation-content">
                  <h3 className="donation-title">{d.campaignTitle}</h3>
                  <div className="donation-meta">
                    <span className="donation-ngo">{d.ngoName}</span>
                    <span className="donation-location">
                      📍 {d.location || "Online"}
                    </span>
                  </div>

                  <div className="donation-progress">
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{
                          width: `${Math.min(d.progressPercentage, 100)}%`,
                        }}
                      ></div>
                    </div>
                    <div className="progress-stats">
                      <span className="raised">
                        ₹{d.raisedAmount.toLocaleString()} raised
                      </span>
                      <span className="goal">
                        of ₹{d.goalAmount.toLocaleString()} (
                        {d.progressPercentage}%)
                      </span>
                    </div>
                  </div>

                  <div className="donation-details">
                    <div className="donation-info">
                      <div className="info-item">
                        <span className="info-label">Your Donation</span>
                        <span className="info-value">
                          ₹{d.amount.toLocaleString()}
                        </span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Date</span>
                        <span className="info-value">
                          {new Date(d.date).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Status</span>
                        <span className={`info-value status-${d.status}`}>
                          {d.status.charAt(0).toUpperCase() + d.status.slice(1)}
                        </span>
                      </div>
                    </div>
                    <div className="donation-actions">
                      <Link
                        to={`/campaigns/${d.campaignId}`}
                        className="btn btn-primary view-campaign-btn"
                      >
                        View Campaign
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <div className="donations-summary">
              <p>
                <strong>Total Donations:</strong> {donations.length}
              </p>
              <p>
                <strong>Total Amount:</strong> ₹
                {donations
                  .reduce((sum, d) => sum + d.amount, 0)
                  .toLocaleString()}
              </p>
              <p>
                <strong>Campaigns Supported:</strong>{" "}
                {new Set(donations.map((d) => d.campaignId)).size}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
