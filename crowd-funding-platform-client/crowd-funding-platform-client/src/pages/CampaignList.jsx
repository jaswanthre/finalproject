import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import ProgressBar from "../components/ProgressBar";
import "../styles/DonorCampaignList.css";

export default function CampaignList() {
  const navigate = useNavigate();
  const [list, setList] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState("All Cities");
  const [cities, setCities] = useState(["All Cities"]);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [campaignType, setCampaignType] = useState("active");

  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get(
          "http://localhost:5000/api/campaigns/campaign/campaigns"
        );
        if (Array.isArray(data)) {
          setList(data);
          const uniqueCities = [
            ...new Set(data.map((c) => c.city || "Unknown")),
          ];
          setCities(["All Cities", ...uniqueCities]);
        }
      } catch (error) {
        console.error("Error fetching campaigns:", error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const campaignsWithStatus = useMemo(() => {
    const now = Date.now();
    return list.map((c) => {
      const dbStatus = (c.status || "").toUpperCase();
      if (dbStatus === "PENDING") {
        return { ...c, status: "pending" };
      }
      if (dbStatus === "ACTIVE") {
        const isCompleted =
          Number(c.raised_amount || 0) >= Number(c.target_amount || 1) ||
          new Date(c.end_date).getTime() < now;
        return { ...c, status: isCompleted ? "completed" : "active" };
      }
      return { ...c, status: dbStatus.toLowerCase() };
    });
  }, [list]);

  const filtered = useMemo(() => {
    let campaigns = campaignsWithStatus.filter((c) => {
      if (c.status === "pending") return false;
      const matchesQ =
        q.trim().length === 0 ||
        (c.title || "").toLowerCase().includes(q.toLowerCase()) ||
        (c.ngo_email || "").toLowerCase().includes(q.toLowerCase());
      const matchesCity =
        selectedCity === "All Cities" || c.city === selectedCity;
      return matchesQ && matchesCity;
    });
    if (campaignType === "active") {
      campaigns = campaigns.filter((c) => c.status === "active");
    } else if (campaignType === "completed") {
      campaigns = campaigns.filter((c) => c.status === "completed");
    }
    return campaigns;
  }, [campaignsWithStatus, q, selectedCity, campaignType]);

  if (loading)
    return (
      <div className="container">
        <p>Loading campaigns...</p>
      </div>
    );

  return (
    <div className="container">
      <div
        style={{
          textAlign: "center",
          marginBottom: "2rem",
          marginTop: "2rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "2rem",
        }}
      >
        <div>
          <h2
            style={{
              fontSize: "2rem",
              fontWeight: "bold",
              marginBottom: "0.5rem",
            }}
          >
            Make a Difference Today
          </h2>
          <p
            style={{
              fontSize: "1.1rem",
              color: "var(--text-muted)",
              maxWidth: "600px",
              margin: "0 auto",
            }}
          >
            Browse campaigns across different cities and support meaningful
            causes.
          </p>
        </div>
        <div>
          <img
            src="https://mir-s3-cdn-cf.behance.net/projects/404/135abd47442843.588daa76f2f02.jpg"
            alt="Make a difference"
            style={{ maxWidth: "300px", borderRadius: "8px" }}
          />
        </div>
      </div>

      <div className="toolbar">
        <div className="search-wrapper">
          <input
            className="input"
            placeholder="Search by title or NGO email"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          {q && (
            <button
              className="clear-search"
              onClick={() => setQ("")}
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>

        <div className="filter-wrapper">
          <label htmlFor="city-filter" className="filter-label">
            Filter by City:
          </label>
          <select
            id="city-filter"
            className="location-select"
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
          >
            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-wrapper">
          <label htmlFor="campaign-type-filter" className="filter-label">
            Show:
          </label>
          <select
            id="campaign-type-filter"
            className="campaign-type-select"
            value={campaignType}
            onChange={(e) => setCampaignType(e.target.value)}
          >
            <option value="active">Active Campaigns</option>
            <option value="completed">Completed Campaigns</option>
            <option value="all">All Campaigns</option>
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <h3>No campaigns found</h3>
          <p>Try adjusting your filters</p>
        </div>
      ) : (
        <div className="grid animate-fade-in">
          {filtered.map((c) => {
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
                  <p className="card-description">
                    {c.description?.substring(0, 100)}...
                  </p>
                  <ProgressBar
                    current={Number(c.raised_amount) || 0}
                    goal={Number(c.target_amount) || 1}
                  />
                  <div className="progress-info">
                    <span>
                      ₹{Number(c.raised_amount || 0).toLocaleString()} raised
                    </span>
                    <span>{progressPercentage}% funded</span>
                  </div>
                  <div className="campaign-dates">
                    <span>
                      Start: {new Date(c.start_date).toLocaleDateString()}
                    </span>
                    <span>End: {new Date(c.end_date).toLocaleDateString()}</span>
                  </div>
                  <div className="card-actions">
                    <button
                      onClick={() => setSelectedCampaign(c)}
                      className="btn btn-orange"
                    >
                      View Details
                    </button>
                  </div>
                  <div className={`campaign-status campaign-status-${c.status}`}>
  Status: {c.status.charAt(0).toUpperCase() + c.status.slice(1)}
</div>

                </div>
              </article>
            );
          })}
        </div>
      )}

      {selectedCampaign && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button
              className="modal-close"
              onClick={() => setSelectedCampaign(null)}
            >
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
                <h4>Description</h4>
                <p>{selectedCampaign.description}</p>
                <div className="detail-row">
                  <div className="detail-group">
                    <h4>NGO Email</h4>
                    <p>{selectedCampaign.ngo_email}</p>
                  </div>
                  <div className="detail-group">
                    <h4>City</h4>
                    <p>{selectedCampaign.city}</p>
                  </div>
                </div>
                <div className="detail-row">
                  <div className="detail-group">
                    <h4>Goal</h4>
                    <p>
                      ₹{Number(selectedCampaign.target_amount).toLocaleString()}
                    </p>
                  </div>
                  <div className="detail-group">
                    <h4>Raised</h4>
                    <p>
                      ₹{Number(selectedCampaign.raised_amount).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="detail-row">
                  <div className="detail-group">
                    <h4>Start</h4>
                    <p>
                      {new Date(
                        selectedCampaign.start_date
                      ).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="detail-group">
                    <h4>End</h4>
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
                  <p>
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
  );
}