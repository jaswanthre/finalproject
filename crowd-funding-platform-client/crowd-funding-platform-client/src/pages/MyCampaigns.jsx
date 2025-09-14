import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import ProgressBar from "../components/ProgressBar";
import "../styles/MyCampaigns.css";

export default function MyCampaigns() {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCampaign, setSelectedCampaign] = useState(null);

  useEffect(() => {
    const fetchCampaigns = async () => {
      if (!user?.email) return;
      setLoading(true);
      try {
        const res = await fetch(
          `http://localhost:5000/api/campaigns/campaign/campaigns/email/${user.email}`,
          {
            headers: { Authorization: `Bearer ${user.token}` },
          }
        );
        const data = await res.json();
        if (data.success) setCampaigns(data.campaigns || []);
      } catch (err) {
        console.error("Error fetching NGO campaigns:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCampaigns();
  }, [user]);

  const handleViewDetails = (campaign) => setSelectedCampaign(campaign);
  const closeDetails = () => setSelectedCampaign(null);

  return (
    <div className="container">
      <div className="stack gap">
        <div className="row spread center">
          <h2>My Campaigns</h2>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading your campaigns...</p>
          </div>
        ) : campaigns.length === 0 ? (
          <div className="empty-state">
            <h3>No campaigns found</h3>
            <p>You haven’t created any campaigns yet.</p>
          </div>
        ) : (
          <div className="grid animate-fade-in">
            {campaigns.map((c) => {
              const progressPercentage = Math.round(
                ((c.raised_amount || 0) / (c.target_amount || 1)) * 100
              );

              return (
                <article className="card campaign-card" key={c.campaign_id}>
                  <img
                    src={
                      c.campaign_image || "https://via.placeholder.com/600x400"
                    }
                    alt={c.title}
                    loading="lazy"
                  />
                  <div className="card-body">
                    <h3 className="card-title">{c.title}</h3>
                    {c.description && (
                      <p className="card-description">{c.description}</p>
                    )}

                    <ProgressBar
                      current={Number(c.raised_amount) || 0}
                      goal={Number(c.target_amount) || 1}
                    />

                    <div className="progress-info">
                      <span className="amount-raised">
                        ₹{Number(c.raised_amount || 0).toLocaleString()} raised
                      </span>
                      <span>{progressPercentage}% funded</span>
                    </div>

                    <div className="campaign-dates">
                      <span>
                        Start: {new Date(c.start_date).toLocaleDateString()}
                      </span>
                      <span>
                        End: {new Date(c.end_date).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="card-actions">
                      <span
                        style={{
                          color: "var(--text-muted)",
                          fontSize: "0.9rem",
                        }}
                      >
                        Goal: ₹{Number(c.target_amount || 0).toLocaleString()}
                      </span>
                      <button
                        onClick={() => handleViewDetails(c)}
                        className="btn btn-orange"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Modal for details */}
        {selectedCampaign && (
          <div className="modal-overlay">
            <div className="modal-content">
              <button className="modal-close" onClick={closeDetails}>
                ×
              </button>

              <div className="modal-header">
                <h3>{selectedCampaign.title}</h3>
              </div>

              <div className="modal-body">
                <img
                  src={
                    selectedCampaign.campaign_image ||
                    "https://via.placeholder.com/600x400"
                  }
                  alt={selectedCampaign.title}
                  className="modal-image"
                />

                <div className="campaign-details">
                  <div className="detail-group">
                    <h4>Description</h4>
                    <p>{selectedCampaign.description}</p>
                  </div>

                  <div className="detail-row">
                    <div className="detail-group">
                      <h4>Goal Amount</h4>
                      <p>
                        ₹
                        {Number(
                          selectedCampaign.target_amount
                        ).toLocaleString()}
                      </p>
                    </div>
                    <div className="detail-group">
                      <h4>Raised</h4>
                      <p>
                        ₹
                        {Number(
                          selectedCampaign.raised_amount
                        ).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="detail-row">
                    <div className="detail-group">
                      <h4>Start Date</h4>
                      <p>
                        {new Date(
                          selectedCampaign.start_date
                        ).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="detail-group">
                      <h4>End Date</h4>
                      <p>
                        {new Date(
                          selectedCampaign.end_date
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="detail-group">
                    <h4>Status</h4>
                    <p>{selectedCampaign.status}</p>
                  </div>

                  <div className="detail-group">
                    <h4>Progress</h4>
                    <ProgressBar
                      current={Number(selectedCampaign.raised_amount)}
                      goal={Number(selectedCampaign.target_amount)}
                    />
                    <p className="progress-text">
                      {Math.round(
                        (Number(selectedCampaign.raised_amount) /
                          Number(selectedCampaign.target_amount)) *
                          100
                      )}
                      % Complete
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
