import client from './client';

/**
 * Fetch all verification requests for admin management
 * @returns {Promise<Array>} Array of verification objects
 */
export const getVerifications = async () => {
  try {
    const response = await client.get('/api/users/verifications');
    return response.data;
  } catch (error) {
    console.error('Error fetching verifications:', error);
    throw error;
  }
};

/**
 * Update verification status
 * @param {number} verification_id - ID of the verification to update
 * @param {string} status - New status (APPROVED/REJECTED)
 * @param {string} [reason] - Reason for rejection (required if status is REJECTED)
 * @returns {Promise<Object>} Updated verification object
 */
export const updateVerification = async (verification_id, status, reason = '') => {
  try {
    const payload = { status };
    if (status === 'REJECTED' && reason) {
      payload.reason = reason;
    }
    
    const response = await client.put(`/api/users/verifications/status/${verification_id}`, payload);
    return response.data;
  } catch (error) {
    console.error('Error updating verification status:', error);
    throw error;
  }
};

/**
 * Delete a verification request
 * @param {number} verification_id - ID of the verification to delete
 * @returns {Promise<Object>} Response object
 */
export const deleteVerification = async (verification_id) => {
  try {
    const response = await client.delete(`/api/users/admin/profile/${verification_id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting verification:', error);
    throw error;
  }
};