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
  const [phone, setPhone] = useState(user?.phone || "");
  const [address, setAddress] = useState(user?.address || "");
  const [bio, setBio] = useState(user?.bio || "");
  
  const [profileImage, setProfileImage] = useState(
    JSON.parse(localStorage.getItem("cf_user"))?.profileImage || user?.profileImage || null
  );
  
  const [successMessage, setSuccessMessage] = useState("");
  const [errors, setErrors] = useState({});
  const [donations, setDonations] = useState([]);

  useEffect(() => {
    if (user) {
      const userDonations = getDonationTransactions();
      setDonations(userDonations);
    }
  }, [user, getDonationTransactions]);

  const validateField = (field, value) => {
    let error = "";

    if (field === "name") {
      if (!value.trim()) {
        error = "Name is required.";
      } else if (!/^[A-Za-z\s]+$/.test(value)) {
        error = "Name must contain only alphabets.";
      }
    }

    if (field === "phone") {
      if (!value.trim()) {
        error = "Phone number is required.";
      } else {
        const match = value.match(/^\+(\d{1,3})(\d{10})$/);
        if (!match) {
          error = "Phone number must start with country code followed by 10 digits.";
        } else {
          const countryCode = match[1];
          const number = match[2];
          if ((countryCode === "91" || countryCode === "1") && number.length !== 10) {
            error = "Phone number must have 10 digits after country code.";
          }
        }
      }
    }

    if (field === "address") {
      if (!value.trim()) {
        error = "Address cannot be empty.";
      }
    }

    if (field === "bio") {
      if (!value.trim()) {
        error = "Bio cannot be empty.";
      }
    }

    setErrors((prev) => ({ ...prev, [field]: error }));
    return error === "";
  };

  const handleSave = () => {
    const isNameValid = validateField("name", name);
    const isPhoneValid = validateField("phone", phone);
    const isAddressValid = validateField("address", address);
    const isBioValid = validateField("bio", bio);

    if (!isNameValid || !isPhoneValid || !isAddressValid || !isBioValid) {
      return;
    }

    const updatedUser = { ...user, name, phone, address, bio, profileImage };
    localStorage.setItem("cf_user", JSON.stringify(updatedUser));

    setSuccessMessage("Profile updated successfully!");
    setIsEditing(false);

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

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    const storedUser = JSON.parse(localStorage.getItem("cf_user")) || user;
    setName(storedUser.name || "");
    setPhone(storedUser.phone || "");
    setAddress(storedUser.address || "");
    setBio(storedUser.bio || "");
    setProfileImage(storedUser.profileImage || user?.profileImage || null);
    setIsEditing(false);
    setErrors({});
  };

  const handleBlur = (field, value) => {
    validateField(field, value);
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
          <div className="success-message">{successMessage}</div>
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
              <>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onBlur={() => handleBlur("name", name)}
                  className={`profile-input ${errors.name ? "input-error" : ""}`}
                />
                {errors.name && <div className="error">{errors.name}</div>}
              </>
            ) : (
              <span>{name}</span>
            )}
          </div>

          <div className="profile-field">
            <label>Phone:</label>
            {isEditing ? (
              <>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  onBlur={() => handleBlur("phone", phone)}
                  placeholder="+91XXXXXXXXXX"
                  className={`profile-input ${errors.phone ? "input-error" : ""}`}
                />
                {errors.phone && <div className="error">{errors.phone}</div>}
              </>
            ) : (
              <span>{phone || "Not provided"}</span>
            )}
          </div>

          <div className="profile-field">
            <label>Address:</label>
            {isEditing ? (
              <>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  onBlur={() => handleBlur("address", address)}
                  className={`profile-input ${errors.address ? "input-error" : ""}`}
                />
                {errors.address && <div className="error">{errors.address}</div>}
              </>
            ) : (
              <span>{address || "Not provided"}</span>
            )}
          </div>

          <div className="profile-field">
            <label>Bio:</label>
            {isEditing ? (
              <>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  onBlur={() => handleBlur("bio", bio)}
                  className={`profile-input ${errors.bio ? "input-error" : ""}`}
                />
                {errors.bio && <div className="error">{errors.bio}</div>}
              </>
            ) : (
              <span>{bio || "Not provided"}</span>
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
              <button className="btn btn-primary" onClick={handleSave}>
                Save
              </button>
              <button className="btn btn-outline" onClick={handleCancel}>
                Cancel
              </button>
            </>
          ) : (
            <button className="btn btn-primary" onClick={handleEdit}>
              Edit Profile
            </button>
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
