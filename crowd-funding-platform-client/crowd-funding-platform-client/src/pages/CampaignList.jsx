import { useEffect, useMemo, useState } from "react";
import client from "../api/client";
import CampaignCard from "../components/CampaignCard";

const fallbackCampaigns = [
  { id: 1, title: "Clean Water for All", ngoName: "AquaCare", goalAmount: 500000, currentAmount: 145000, category: "Health", location: "Hyderabad" },
  { id: 2, title: "Educate 100 Girls", ngoName: "BrightFuture", goalAmount: 300000, currentAmount: 220000, category: "Education", location: "Bengaluru" },
  { id: 3, title: "Tree Plantation Drive", ngoName: "GreenWorld", goalAmount: 150000, currentAmount: 60000, category: "Environment", location: "Chennai" },
];

export default function CampaignList() {
  const [list, setList] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await client.get("/api/campaigns");
        setList(Array.isArray(data) ? data : fallbackCampaigns);
      } catch {
        setList(fallbackCampaigns);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    return list.filter((c) => {
      const matchesQ =
        q.trim().length === 0 ||
        c.title.toLowerCase().includes(q.toLowerCase()) ||
        (c.ngoName || "").toLowerCase().includes(q.toLowerCase());
      return matchesQ;
    });
  }, [list, q]);

  if (loading) return <div className="container"><p>Loading campaigns...</p></div>;

  return (
    <div className="container">
      {/* ✅ New Heading & Tagline */}
      <div style={{ textAlign: "center", marginBottom: "2rem", marginTop: "2rem" }}>
        <h2 style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "0.5rem" }}>
          Make a Difference Today
        </h2>
        <p style={{ fontSize: "1.1rem", color: "var(--text-muted)", maxWidth: "600px", margin: "0 auto" }}>
          Join thousands of people supporting meaningful causes around the world. 
          Every donation counts towards creating positive change.
        </p>
      </div>

      <div className="toolbar">
        <div className="search-wrapper">
          <svg className="search-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input 
            className="input" 
            placeholder="Search campaigns by title or organization" 
            value={q} 
            onChange={(e)=>setQ(e.target.value)} 
          />
          {q && (
            <button 
              className="clear-search" 
              onClick={() => setQ('')}
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <h3>No campaigns found</h3>
          <p>Try adjusting your search criteria</p>
        </div>
      ) : (
        <div className="grid animate-fade-in">
          {filtered.map((c) => <CampaignCard key={c.id} c={c} />)}
        </div>
      )}
    </div>
  );
}
