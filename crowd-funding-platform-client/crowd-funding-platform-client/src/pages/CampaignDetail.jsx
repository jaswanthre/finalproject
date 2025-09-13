import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import client from "../api/client";
import ProgressBar from "../components/ProgressBar";
import DonationForm from "../components/DonationForm";

export default function CampaignDetail() {
  const { id } = useParams();
  const [c, setC] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await client.get(`/api/campaigns/${id}`);
        setC(data);
      } catch {
        // fallback mock
        setC({
          id,
          title: "Sample Campaign",
          description: "This is a sample description. Replace with data from your backend.",
          ngoName: "AquaCare",
          goalAmount: 500000,
          currentAmount: 145000,
          updates: [
            { id: 1, text: "Phase 1 complete: 5 wells dug.", date: "2025-08-01" },
            { id: 2, text: "Phase 2 underway in nearby villages.", date: "2025-08-15" },
          ],
        });
      }
    })();
  }, [id]);

  if (!c) return <div className="container"><p>Loading...</p></div>;

  return (
    <div className="container campaign-detail">
      <div className="detail-main">
        <img className="hero" src={c.image || "https://picsum.photos/seed/c" + c.id + "/960/540"} alt={c.title} />
        <h1>{c.title}</h1>
        <p className="muted">NGO: {c.ngoName}</p>
        <ProgressBar current={c.currentAmount} goal={c.goalAmount} />
        <p className="lead">{c.description}</p>

        <section>
          <h3>Progress updates</h3>
          {(c.updates || []).map((u)=>(
            <div key={u.id} className="update">
              <div className="update-date">{u.date}</div>
              <p>{u.text}</p>
            </div>
          ))}
        </section>
      </div>

      <aside className="detail-aside">
        <div className="card sticky donation-card">
          <h3 className="donation-title">Donate to this campaign</h3>
          <div className="donation-stats">
            <div className="donation-stat">
              <span className="stat-value">₹{c.currentAmount?.toLocaleString?.()}</span>
              <span className="stat-label">Raised</span>
            </div>
            <div className="donation-stat">
              <span className="stat-value">₹{c.goalAmount?.toLocaleString?.()}</span>
              <span className="stat-label">Goal</span>
            </div>
          </div>
          <DonationForm campaignId={c.id} />
          <p className="donation-secure"><span className="secure-icon">🔒</span> Secure donation</p>
        </div>
      </aside>
    </div>
  );
}
