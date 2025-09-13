import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useWallet } from "../context/WalletContext";
import "./Profile.css";

export default function Profile() {
  const { user } = useAuth();
  const { getDonationTransactions } = useWallet();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [profileImage, setProfileImage] = useState(user?.profileImage || null);
  const [successMessage, setSuccessMessage] = useState("");
  const [donations, setDonations] = useState([]);
  
  useEffect(() => {
    if (user) {
      // Get donations from wallet context
      const userDonations = getDonationTransactions();
      setDonations(userDonations);
    }
  }, [user, getDonationTransactions]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    // In a real application, you would make an API call to update the user's name
    // For now, we'll just update it in local storage
    const updatedUser = { ...user, name, profileImage };
    localStorage.setItem("cf_user", JSON.stringify(updatedUser));
    
    setSuccessMessage("Profile updated successfully!");
    setIsEditing(false);
    
    // Clear success message after 3 seconds
    setTimeout(() => {
      setSuccessMessage("");
    }, 3000);
  };
  
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCancel = () => {
    setName(user?.name || "");
    setIsEditing(false);
  };

  if (!user) {
    return (
      <div className="container profile-container">
        <div className="card profile-card">
          <h2>Profile</h2>
          <p>Please log in to view your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container profile-container">
      <div className="card profile-card">
        <h2>My Profile</h2>
        
        {successMessage && (
          <div className="success-message">
            {successMessage}
          </div>
        )}
        
        <div className="profile-image-container">
          {profileImage ? (
            <img src={profileImage} alt="Profile" className="profile-image" />
          ) : (
            <div className="profile-image-placeholder">
              {user?.name?.charAt(0) || "U"}
            </div>
          )}
          
          {isEditing && (
            <div className="profile-image-upload">
              <label htmlFor="profile-image-input" className="image-upload-label">
                Change Photo
              </label>
              <input 
                id="profile-image-input"
                type="file" 
                accept="image/*" 
                onChange={handleImageChange} 
                className="image-upload-input"
              />
            </div>
          )}
        </div>
        
        <div className="profile-info">
          <div className="profile-field">
            <label>Name:</label>
            {isEditing ? (
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                className="profile-input"
              />
            ) : (
              <span>{user.name}</span>
            )}
          </div>
          
          <div className="profile-field">
            <label>Email:</label>
            <span>{user.email}</span>
          </div>
          
          <div className="profile-field">
            <label>Role:</label>
            <span>{user.role}</span>
          </div>
        </div>
        
        <div className="profile-actions">
          {isEditing ? (
            <>
              <button className="btn btn-primary" onClick={handleSave}>Save</button>
              <button className="btn btn-outline" onClick={handleCancel}>Cancel</button>
            </>
          ) : (
            <button className="btn btn-primary" onClick={handleEdit}>Edit Profile</button>
          )}
        </div>
        
        <div className="profile-links">
          <h3>Account Management</h3>
          <div className="profile-link-container">
            <Link to="/my-donations" className="profile-link">
              <span className="profile-link-icon">💰</span>
              <span className="profile-link-text">My Donations</span>
            </Link>
            <Link to="/my-transactions" className="profile-link">
              <span className="profile-link-icon">📊</span>
              <span className="profile-link-text">My Transactions</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}