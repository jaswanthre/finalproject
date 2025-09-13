// Simplified mock API service for fallback when real API is unavailable
import { campaigns, getCampaignById } from './mockData';

// Simulates API response with minimal delay
const simulateResponse = (data, delay = 300) => {
  return new Promise((resolve) => {
    setTimeout(() => resolve({ data }), delay);
  });
};

// Mock API endpoints
const mockAPI = {
  // Get all campaigns
  getCampaigns: () => simulateResponse(campaigns),
  
  // Get a specific campaign by ID
  getCampaign: (id) => {
    const campaign = getCampaignById(id);
    if (!campaign) {
      return Promise.reject(new Error('Campaign not found'));
    }
    return simulateResponse(campaign);
  },
  
  // Make a donation to a campaign
  makeDonation: (campaignId, amount, donorInfo) => {
    const campaign = getCampaignById(campaignId);
    if (!campaign) {
      return Promise.reject(new Error('Campaign not found'));
    }
    
    // Simulate successful donation
    return simulateResponse({
      success: true,
      message: 'Donation successful',
      donation: {
        id: `don-${Date.now()}`,
        campaignId,
        campaignTitle: campaign.title,
        campaignImage: campaign.image,
        ngoName: campaign.ngoName,
        amount,
        date: new Date().toISOString(),
        location: donorInfo?.location || 'Online',
        status: 'Completed'
      }
    });
  }
};

export default mockAPI;