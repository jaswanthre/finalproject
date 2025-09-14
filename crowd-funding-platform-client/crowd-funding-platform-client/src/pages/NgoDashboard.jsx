import { Link } from "react-router-dom";

export default function NgoDashboard() {
  return (
    <div className="container">
      <div className="stack gap">
        <div className="row spread center">
          <h2>Your Campaigns</h2>
          <Link to="/create-campaign" className="btn">Create Campaign</Link>
        </div>
        <div className="card">
          <p className="muted">Fetch your NGO campaigns from /api/campaigns?ngo=you</p>
          <ul className="list">
            <li>Campaign A — ₹120,000 of ₹300,000</li>
            <li>Campaign B — ₹60,500 of ₹80,000</li>
          </ul>
        </div>
        <div className="card">
          <h3>Post Progress Update</h3>
          <p className="muted">Form to POST /api/campaigns/:id/updates</p>
        </div>
      </div>
    </div>
  );
}
