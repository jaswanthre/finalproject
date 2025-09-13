import { Link } from "react-router-dom";
import ProgressBar from "./ProgressBar";

export default function CampaignCard({ c }) {
  const progressPercentage = Math.round(
    ((c.currentAmount || 0) / (c.goalAmount || 1)) * 100
  );

  // Your fallback image list
  const fallbackImages = [
    "https://i.pinimg.com/736x/4b/9a/0c/4b9a0c0e54e8c9d8e730f43ab6248739.jpg",
    "https://tse3.mm.bing.net/th/id/OIP.IzrsYeCNrpvSbh3flrrHvAHaE8?r=0&cb=thfvnext&rs=1&pid=ImgDetMain&o=7&rm=3",
    "https://www.povertyactionlab.org/sites/default/files/styles/large/public/2023-02/2409_photo_0.jpg?itok=4AuyVEq4"
    
  ];
  //route

  // Pick fallback based on campaign id (so different campaigns don’t repeat same image)
  const fallbackImage = fallbackImages[c.id % fallbackImages.length];

  return (
    <article className="card campaign-card">
      <img
        src={c.image || fallbackImage}
        alt={c.title}
        loading="lazy"
      />
      <div className="card-body">
        <h3 className="card-title">{c.title}</h3>
        <div className="card-meta">
          <span>by {c.ngoName || c.ngo || "Anonymous NGO"}</span>
          {c.location && <span>📍 {c.location}</span>}
        </div>

        {c.description && (
          <p
            style={{
              color: "var(--text-muted)",
              fontSize: "0.95rem",
              marginBottom: "1rem",
              lineHeight: "1.5",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {c.description}
          </p>
        )}

        <ProgressBar current={c.currentAmount || 0} goal={c.goalAmount || 1} />

        <div className="progress-info">
          <span className="amount-raised">
            ₹{(c.currentAmount || 0).toLocaleString()} raised
          </span>
          <span>{progressPercentage}% funded</span>
        </div>

        <div className="card-actions">
          <span style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
            Goal: ₹{(c.goalAmount || 0).toLocaleString()}
          </span>
          <Link to={`/campaigns/${c.id}`} className="btn btn-orange">
            View Details
          </Link>
        </div>
      </div>
    </article>
  );
}
