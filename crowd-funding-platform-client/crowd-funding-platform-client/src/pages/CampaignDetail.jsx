import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import client, { campaignServiceClient } from "../api/client";
import mockAPI from "../api/mockService";
import ProgressBar from "../components/ProgressBar";
import DonationForm from "../components/DonationForm";

export default function CampaignDetail() {
  const { id } = useParams();
  const [c, setC] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        // Try to get data from backend campaign service
        const { data } = await campaignServiceClient.get(`/campaign/${id}`);
        
        // Transform backend data to match the expected format
        const campaignData = {
          id: data.campaign_id,
          title: data.title,
          description: data.description,
          ngoName: data.ngo_name,
          goalAmount: data.goal_amount,
          currentAmount: data.raised_amount,
          image: data.image_url,
          location: data.location || 'Online',
          updates: []
        };
        
        // Try to fetch campaign updates if available
        try {
          const updatesResponse = await campaignServiceClient.get(`/campaign/${id}/updates`);
          if (updatesResponse.data && Array.isArray(updatesResponse.data)) {
            campaignData.updates = updatesResponse.data.map(update => ({
              id: update.update_id,
              date: new Date(update.update_date).toLocaleDateString(),
              text: update.update_text
            }));
          }
        } catch (updateError) {
          console.error('Error fetching campaign updates:', updateError);
          // Continue without updates if they can't be fetched
        }
        
        setC(campaignData);
      } catch (error) {
        console.error('Error fetching campaign details:', error);
        // If backend API fails, try mock API service
        try {
          const { data } = await mockAPI.getCampaign(id);
          setC(data);
        } catch (mockError) {
          // If both real and mock APIs fail, use a minimal fallback
          setC({
            id,
            title: "Campaign Not Found",
            description: "Unable to load campaign details.",
            ngoName: "Unknown",
            goalAmount: 100000,
            currentAmount: 0,
            image: "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?q=80&w=1000&auto=format&fit=crop",
            location: "Online",
            updates: [],
          });
        }
      }
    })();
  }, [id]);

  if (!c) return <div className="container"><p>Loading...</p></div>;

  // Calculate if campaign goal has been reached
  const isGoalReached = c.currentAmount >= c.goalAmount;
  const progressPercentage = Math.round((c.currentAmount / c.goalAmount) * 100);

  return (
    <div className="container campaign-detail">
      <div className="detail-main">
        <img className="hero" src={c.image || "https://picsum.photos/seed/c" + c.id + "/960/540"} alt={c.title} />
        <h1>{c.title}</h1>
        <p className="muted">NGO: {c.ngoName}</p>
        <ProgressBar current={c.currentAmount} goal={c.goalAmount} />
        <div className="campaign-progress-info">
          <span>₹{c.currentAmount?.toLocaleString?.()} raised of ₹{c.goalAmount?.toLocaleString?.()}</span>
          <span>{progressPercentage}% funded</span>
        </div>
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
          {isGoalReached ? (
            <div className="campaign-completed">
              <div className="campaign-completed-icon">🎉</div>
              <h3 className="campaign-completed-title">Campaign Completed!</h3>
              <p className="campaign-completed-message">
                This campaign has successfully reached its funding goal. Thank you to all donors who contributed!
              </p>
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
            </div>
          ) : (
            <>
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
              <DonationForm 
                campaignId={c.id} 
                campaignTitle={c.title} 
                campaignImage={c.image} 
                ngoName={c.ngoName} 
                goalAmount={c.goalAmount} 
                raisedAmount={c.currentAmount} 
                location={c.location || 'Online'} 
              />
              <p className="donation-secure"><span className="secure-icon">🔒</span> Secure donation</p>
            </>
          )}
        </div>
      </aside>
    </div>
  );
}
