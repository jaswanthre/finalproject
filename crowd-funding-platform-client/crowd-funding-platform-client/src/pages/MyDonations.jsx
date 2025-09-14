import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useWallet } from "../context/WalletContext";
import { Link } from "react-router-dom";
import client, { donorServiceClient, campaignServiceClient } from "../api/client";
import mockAPI from "../api/mockService";
import "./MyDonations.css";

export default function MyDonations() {
  const { user } = useAuth();
  const { getDonationTransactions } = useWallet();
  const [loading, setLoading] = useState(true);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [feedbackImage, setFeedbackImage] = useState(null);
  const [showFeedbackSuccess, setShowFeedbackSuccess] = useState(false);
  const [donations, setDonations] = useState([]);

  useEffect(() => {
    const fetchDonations = async () => {
      setLoading(true);
      try {
        // Try to fetch from backend API
        if (user?.email) {
          const response = await donorServiceClient.get(`/donation?donor_email=${user.email}`);
          if (response.data && Array.isArray(response.data)) {
            // Transform backend data to match the expected format
            const formattedDonations = await Promise.all(response.data.map(async (donation) => {
              // Fetch campaign details for each donation
              try {
                const campaignResponse = await campaignServiceClient.get(`/campaign/${donation.campaign_id}`);
                const campaign = campaignResponse.data;
                
                return {
                  id: donation.donation_id,
                  campaignId: donation.campaign_id,
                  amount: donation.amount,
                  date: donation.donation_date || new Date().toISOString(),
                  status: donation.status || 'completed',
                  campaignTitle: campaign.title,
                  campaignImage: campaign.image_url,
                  ngoName: campaign.ngo_name,
                  location: campaign.location,
                  goalAmount: campaign.goal_amount,
                  raisedAmount: campaign.raised_amount,
                  progressPercentage: (campaign.raised_amount / campaign.goal_amount) * 100
                };
              } catch (error) {
                // If campaign fetch fails, use basic donation data
                return {
                  id: donation.donation_id,
                  campaignId: donation.campaign_id,
                  amount: donation.amount,
                  date: donation.donation_date || new Date().toISOString(),
                  status: donation.status || 'completed',
                  campaignTitle: 'Campaign',
                  campaignImage: '',
                  ngoName: 'NGO',
                  location: 'Online',
                  goalAmount: 0,
                  raisedAmount: 0,
                  progressPercentage: 0
                };
              }
            }));
            setDonations(formattedDonations);
          }
        }
      } catch (error) {
        console.error('Error fetching donations:', error);
        // Fallback to wallet context donations if API fails
        setDonations(getDonationTransactions());
      } finally {
        setLoading(false);
      }
    };
    
    fetchDonations();
  }, [user]);

  const handleFeedbackClick = (donation) => {
    setSelectedDonation(donation);
    setShowFeedbackForm(true);
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Send feedback to the backend API
      await donorServiceClient.post('/donation/feedback', {
        donation_id: selectedDonation.id,
        feedback_text: feedback,
        feedback_image: feedbackImage // Note: In a real implementation, you'd need to handle file uploads properly
      });
      
      setShowFeedbackSuccess(true);
      
      // Reset and redirect after 2 seconds
      setTimeout(() => {
        setShowFeedbackForm(false);
        setShowFeedbackSuccess(false);
        setFeedback("");
        setFeedbackImage(null);
        setSelectedDonation(null);
      }, 2000);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      // Show error message to user
      alert('Failed to submit feedback. Please try again.');
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFeedbackImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

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
      {showFeedbackForm ? (
        <div className="card feedback-card">
          {showFeedbackSuccess ? (
            <div className="feedback-success">
              <h2>Thank you for your valuable feedback!</h2>
              <p>Redirecting to donations page...</p>
            </div>
          ) : (
            <>
              <h2>Provide Feedback</h2>
              <p>Campaign: {selectedDonation?.campaignTitle}</p>

              <form onSubmit={handleFeedbackSubmit} className="feedback-form">
                <div className="form-group">
                  <label htmlFor="feedback">Your Feedback</label>
                  <textarea
                    id="feedback"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    required
                    rows="4"
                    placeholder="Share your thoughts about this donation..."
                  ></textarea>
                </div>

                <div className="form-group">
                  <label htmlFor="feedbackImage">Upload Image (Optional)</label>
                  <input
                    type="file"
                    id="feedbackImage"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                  {feedbackImage && (
                    <div className="image-preview">
                      <img src={feedbackImage} alt="Preview" />
                    </div>
                  )}
                </div>

                <div className="feedback-actions">
                  <button type="submit" className="btn btn-primary">
                    Submit Feedback
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => setShowFeedbackForm(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      ) : (
        <div className="card donations-card">
          <div className="donations-header-title">
            <h2>My Donations</h2>
            <p className="donations-subtitle">Your contribution history</p>
          </div>

          <div className="donations-image-container">
            <img
              src="https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8ZG9uYXRpb258ZW58MHx8MHx8fDA%3D"
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
              {donations.map((donation) => (
                <div key={donation.id} className="donation-card">
                  <div className="donation-image">
                    <img src={donation.image || donation.campaignImage} alt={donation.campaignTitle} />
                    {donation.progressPercentage >= 100 && (
                      <div className="campaign-completed-badge">
                        Campaign Completed
                      </div>
                    )}
                  </div>
                  <div className="donation-content">
                    <h3 className="donation-title">
                      {donation.campaignTitle}
                    </h3>
                    <div className="donation-meta">
                      <span className="donation-ngo">{donation.ngoName}</span>
                      <span className="donation-location">
                        📍 {donation.location || 'Online'}
                      </span>
                    </div>
                    <div className="donation-progress">
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{
                            width: `${Math.min(
                              donation.progressPercentage,
                              100
                            )}%`,
                          }}
                        ></div>
                      </div>
                      <div className="progress-stats">
                        <span className="raised">
                          ₹{donation.raisedAmount.toLocaleString()} raised
                        </span>
                        <span className="goal">
                          of ₹{donation.goalAmount.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <div className="donation-details">
                      <div className="donation-info">
                        <div className="info-item">
                          <span className="info-label">Your Donation</span>
                          <span className="info-value">
                            ₹{donation.amount.toLocaleString()}
                          </span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">Date</span>
                          <span className="info-value">
                            {new Date(donation.date).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">Status</span>
                          <span
                            className={`info-value status-${donation.status}`}
                          >
                            {donation.status.charAt(0).toUpperCase() +
                              donation.status.slice(1)}
                          </span>
                        </div>
                      </div>
                      <div className="donation-actions">
                        <Link
                          to={`/campaigns/${donation.campaignId}`}
                          className="btn btn-primary view-campaign-btn"
                        >
                          View Campaign
                        </Link>
                        <button
                          className="btn btn-outline feedback-btn"
                          onClick={() => handleFeedbackClick(donation)}
                        >
                          Add Feedback
                        </button>
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
                    .reduce((sum, donation) => sum + donation.amount, 0)
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
      )}
    </div>
  );
}