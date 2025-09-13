import client from './client';

/**
 * Fetch all users for admin management
 * @returns {Promise<Array>} Array of user objects
 */
export const getUsers = async () => {
  try {
    const response = await client.get('/api/users/admin/users');
    return response.data;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

/**
 * Fetch current logged-in user profile data
 * @returns {Promise<Object>} User profile object
 */
export const getCurrentUser = async () => {
  try {
    const response = await client.get('/api/user/me');
    return response.data;
  } catch (error) {
    console.error('Error fetching current user profile:', error);
    throw error;
  }
};

/**
 * Update user role
 * @param {string} email - Email of the user to update
 * @param {string} role - New role (ADMIN/NGO/DONOR)
 * @returns {Promise<Object>} Updated user object
 */
export const updateUserRole = async (email, role) => {
  try {
    // First, get the current user data to ensure we have all required fields
    const currentUserData = await client.get(`/api/users/admin/users`);
    const userData = currentUserData.data.find(user => 
      (user.email === email || user.user_email === email)
    );
    
    if (!userData) {
      throw new Error(`User with email ${email} not found`);
    }
    
    // Prepare the complete user object with updated role as required by backend
    const completeUserData = {
      name: userData.name || userData.firstName || userData.firstname || '',
      password: userData.password || 'defaultpassword', // Since passwords are not returned, use a placeholder
      role: role,
      is_verified: userData.is_verified !== undefined ? userData.is_verified : true
    };
    
    // Send the complete user object in the request body as required by backend controller
    const response = await client.put(`/api/users/admin/user/role`, {
      email: email,
      role: role
    });
    
    // Log successful response for debugging
    console.log('Role update successful:', response.data);
    return response.data;
  } catch (error) {
    // Log detailed error information for debugging
    console.error('Error updating user role:', error);
    console.error('Error response:', error.response?.data);
    throw error;
  }
};

/**
 * Delete a user
 * @param {string} email - Email of the user to delete
 * @returns {Promise<Object>} Response object
 */
export const deleteUser = async (email) => {
  try {
    const response = await client.delete(`/api/users/admin/user`, {
      data: { email: email }
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};