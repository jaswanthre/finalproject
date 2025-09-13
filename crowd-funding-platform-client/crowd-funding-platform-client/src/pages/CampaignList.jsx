import { useEffect, useMemo, useState } from "react";
import client, { campaignServiceClient } from "../api/client";
import CampaignCard from "../components/CampaignCard";

// Minimal fallback campaigns in case API fails
const fallbackCampaigns = [
  { id: 1, title: "Clean Water for All", ngoName: "AquaCare", goalAmount: 500000, currentAmount: 145000, category: "Health", location: "Hyderabad" },
  { id: 2, title: "Educate 100 Girls", ngoName: "BrightFuture", goalAmount: 300000, currentAmount: 220000, category: "Education", location: "Bengaluru" },
];

export default function CampaignList() {
  const [list, setList] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState("All Locations");
  const [locations, setLocations] = useState(["All Locations"]);

  useEffect(() => {
    (async () => {
      try {
        // Try to fetch from backend campaign service
        const { data } = await campaignServiceClient.get("/campaign");
        
        // Transform backend data to match the expected format
        const campaigns = Array.isArray(data) ? data.map(campaign => ({
          id: campaign.campaign_id,
          title: campaign.title,
          ngoName: campaign.ngo_name,
          goalAmount: campaign.goal_amount,
          currentAmount: campaign.raised_amount,
          category: campaign.category_name || 'Other',
          location: campaign.location || 'Online',
          image: campaign.image_url,
          description: campaign.description
        })) : fallbackCampaigns;
        
        setList(campaigns);
        
        // Extract unique locations from campaigns
        const uniqueLocations = [...new Set(campaigns.map(c => c.location).filter(Boolean))];
        setLocations(["All Locations", ...uniqueLocations]);
      } catch (error) {
        console.error('Error fetching campaigns:', error);
        // Fallback to mock data if API fails
        setList(fallbackCampaigns);
        
        // Extract unique locations from fallback campaigns
        const uniqueLocations = [...new Set(fallbackCampaigns.map(c => c.location).filter(Boolean))];
        setLocations(["All Locations", ...uniqueLocations]);
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
      
      const matchesLocation = 
        selectedLocation === "All Locations" || 
        c.location === selectedLocation;
      
      return matchesQ && matchesLocation;
    });
  }, [list, q, selectedLocation]);

  if (loading) return <div className="container"><p>Loading campaigns...</p></div>;

  return (
    <div className="container">
      {/* ✅ New Heading & Tagline */}
      <div style={{ textAlign: "center", marginBottom: "2rem", marginTop: "2rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "2rem" }}>
        <div>
          <h2 style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "0.5rem" }}>
            Make a Difference Today
          </h2>
          <p style={{ fontSize: "1.1rem", color: "var(--text-muted)", maxWidth: "600px", margin: "0 auto" }}>
            Join thousands of people supporting meaningful causes around the world. 
            Every donation counts towards creating positive change.
          </p>
        </div>
        <div>
          <img src="https://mir-s3-cdn-cf.behance.net/projects/404/135abd47442843.588daa76f2f02.jpg" alt="Make a difference" style={{ maxWidth: "300px", borderRadius: "8px" }} />
        </div>
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
        
        <div className="filter-wrapper">
          <label htmlFor="location-filter" className="filter-label">Filter by Location:</label>
          <select 
            id="location-filter"
            className="location-select"
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
          >
            {locations.map(location => (
              <option key={location} value={location}>{location}</option>
            ))}
          </select>
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
