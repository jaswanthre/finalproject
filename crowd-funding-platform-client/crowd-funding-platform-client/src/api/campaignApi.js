import client from './client';

/**
 * Fetch all campaigns for admin management
 * @returns {Promise<Array>} Array of campaign objects
 */
export const getCampaigns = async () => {
  try {
    const response = await client.get('/api/campaigns');
    return response.data;
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    throw error;
  }
};

/**
 * Update campaign status
 * @param {number} id - ID of the campaign to update
 * @param {string} status - New status (APPROVED/REJECTED/INACTIVE)
 * @param {string} [reason] - Reason for rejection or deactivation (optional)
 * @returns {Promise<Object>} Updated campaign object
 */
export const updateCampaignStatus = async (id, status, reason = '') => {
  try {
    const payload = { status };
    if ((status === 'REJECTED' || status === 'INACTIVE') && reason) {
      payload.reason = reason;
    }
    
    const response = await client.put(`/api/campaigns/${id}/status`, payload);
    return response.data;
  } catch (error) {
    console.error('Error updating campaign status:', error);
    throw error;
  }
};

/**
 * Delete a campaign
 * @param {number} id - ID of the campaign to delete
 * @returns {Promise<Object>} Response object
 */
export const deleteCampaign = async (id) => {
  try {
    const response = await client.delete(`/api/campaigns/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting campaign:', error);
    throw error;
  }
};