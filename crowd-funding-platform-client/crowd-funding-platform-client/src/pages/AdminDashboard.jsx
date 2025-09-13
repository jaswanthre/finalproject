
import { useEffect, useState, useRef } from "react";
import client from "../api/client";
import { getVerifications, updateVerification, deleteVerification } from "../api/verificationApi";
import { getCampaigns, updateCampaignStatus, deleteCampaign } from "../api/campaignApi";
import { getUsers, updateUserRole, deleteUser, getCurrentUser } from "../api/userApi";
import "./AdminDashboard.css";

const MOCK_DATA = {
  admin: {
    name: "Admin User",
    email: "admin@example.com",
    role: "ADMIN",
    profileImage: "https://ui-avatars.com/api/?name=Admin+User&background=0D8ABC&color=fff",
    joinDate: "January 15, 2023",
    lastLogin: "Today at 9:30 AM",
    permissions: ["User Management", "Campaign Moderation", "NGO Verification"]
  },
  users: [
    { email: "admin@example.com", role: "ADMIN", isVerified: true },
    { email: "donor@example.com", role: "DONOR", isVerified: true },
    { email: "ngo@example.com", role: "NGO", isVerified: true },
    { email: "pending@example.com", role: "NGO", isVerified: false },
  ],
  campaigns: [
    { id: 1, title: "Help Children Education", ngoName: "Education NGO", status: "PENDING" },
    { id: 2, title: "Clean Water Initiative", ngoName: "Water NGO", status: "APPROVED" },
    { id: 3, title: "Wildlife Conservation", ngoName: "Wildlife NGO", status: "INACTIVE" },
  ],
  verifications: [
    { 
      verification_id: 1, 
      email: "ngo1@example.com", 
      status: "PENDING",
      ngo_registration_doc: "https://example.com/doc1.pdf",
      pan_card: "https://example.com/pan1.pdf",
      bank_proof: "https://example.com/bank1.pdf",
      id_proof: "https://example.com/id1.pdf"
    },
    { 
      verification_id: 2, 
      email: "ngo2@example.com", 
      status: "APPROVED",
      ngo_registration_doc: "https://example.com/doc2.pdf",
      pan_card: "https://example.com/pan2.pdf",
      bank_proof: "https://example.com/bank2.pdf",
      id_proof: "https://example.com/id2.pdf"
    },
    { 
      verification_id: 3, 
      email: "ngo3@example.com", 
      status: "REJECTED",
      ngo_registration_doc: "https://example.com/doc3.pdf",
      pan_card: "https://example.com/pan3.pdf",
      bank_proof: "https://example.com/bank3.pdf",
      id_proof: "https://example.com/id3.pdf"
    },
  ]
};

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [verifications, setVerifications] = useState([]);
  const [activeTab, setActiveTab] = useState("users");
  const [editingUser, setEditingUser] = useState(null);
  const [editRole, setEditRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [adminData, setAdminData] = useState(null);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const profileDropdownRef = useRef(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch verifications
      try {
        const verificationsData = await getVerifications();
        setVerifications(verificationsData);
      } catch (verificationError) {
        console.error("Error fetching verifications:", verificationError);
        // Fallback to mock data if API fails
        setVerifications(MOCK_DATA.verifications);
      }

      // Fetch campaigns
      try {
        const campaignsData = await getCampaigns();
        setCampaigns(campaignsData);
      } catch (campaignError) {
        console.error("Error fetching campaigns:", campaignError);
        // Fallback to mock data if API fails
        setCampaigns(MOCK_DATA.campaigns);
      }

      // Fetch users
      try {
        const usersData = await getUsers();
        setUsers(usersData);
      } catch (userError) {
        console.error("Error fetching users:", userError);
        // Fallback to mock data if API fails
        setUsers(MOCK_DATA.users);
      }
      
      // Get real user data from API first, then fallback to localStorage if needed
      try {
        // First try to get from API
        const currentUserData = await getCurrentUser();
        const formattedUserData = {
          name: currentUserData.name || "Admin User",
          email: currentUserData.email,
          role: currentUserData.role || "ADMIN",
          profileImage: currentUserData.profile_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUserData.name || "Admin User")}&background=0D8ABC&color=fff`,
          joinDate: currentUserData.join_date || "Not available",
          lastLogin: currentUserData.last_login || "Today",
          permissions: currentUserData.permissions || ["User Management", "Campaign Moderation", "NGO Verification"]
        };
        setAdminData(formattedUserData);
        
        // Also update localStorage with the latest data
        localStorage.setItem("cf_user", JSON.stringify(currentUserData));
      } catch (profileError) {
        console.error("Error fetching admin profile from API:", profileError);
        
        // Fallback to localStorage if API fails
        try {
          const storedUser = localStorage.getItem("cf_user");
          if (storedUser) {
            const userData = JSON.parse(storedUser);
            // Format the data to match the expected structure
            const formattedUserData = {
              name: userData.name || "Admin User",
              email: userData.email,
              role: userData.role || "ADMIN",
              profileImage: userData.profile_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name || "Admin User")}&background=0D8ABC&color=fff`,
              joinDate: userData.join_date || "Not available",
              lastLogin: userData.last_login || "Today",
              permissions: userData.permissions || ["User Management", "Campaign Moderation", "NGO Verification"]
            };
            setAdminData(formattedUserData);
          } else {
            // If no user in localStorage either, use mock data
            setAdminData(MOCK_DATA.admin);
          }
        } catch (localStorageError) {
          console.error("Error fetching admin profile from localStorage:", localStorageError);
          // Fallback to mock data if both API and localStorage fail
          setAdminData(MOCK_DATA.admin);
        }
      }
      
      setLoading(false);
    } catch (error) {
      setMessage({ text: error.message || "Failed to fetch data", type: "error" });
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    // Removed click-outside functionality as requested
    function handleClickOutside(event) {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target) && 
          !event.target.closest('.profile-icon')) {
        setShowProfileDropdown(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  const [viewedDocuments, setViewedDocuments] = useState({});

  const markDocumentViewed = (verificationId, docType) => {
    setViewedDocuments(prev => ({
      ...prev,
      [`${verificationId}_${docType}`]: true
    }));
  };
  
  const getDocumentLabel = (fileType) => {
    const documentLabels = {
      'NGO_REGISTRATION': 'Registration Doc',
      'PAN': 'PAN Card',
      'BANK_PROOF': 'Bank Proof',
      'ID_PROOF': 'ID Proof',
      'registration': 'Registration Doc',
      'pan': 'PAN Card',
      'bank': 'Bank Proof',
      'id': 'ID Proof'
    };
    
    return documentLabels[fileType] || fileType || 'Document';
  };
  
  const hasViewedRequiredDocuments = (verificationId) => {
    // Check if at least one document has been viewed for this verification
    // Handle both legacy document structure and AWS API structure
    return Object.keys(viewedDocuments).some(key => key.startsWith(`${verificationId}_`));
  };
  
  const getDocumentCount = (verification) => {
    // Check for files array first (new structure)
    if (verification.files && verification.files.length > 0) {
      return verification.files.length;
    }
    
    // Check for documents array (AWS API structure)
    if (verification.documents && verification.documents.length > 0) {
      return verification.documents.length;
    }
    
    // Check for legacy document structure
    let count = 0;
    if (verification.ngo_registration_doc) count++;
    if (verification.pan_card) count++;
    if (verification.bank_proof) count++;
    if (verification.id_proof) count++;
    
    return count;
  };

  const handleUpdateVerification = async (id, status, rejectedReason = null) => {
    try {
      setLoading(true);
      await updateVerification(id, status, rejectedReason);
      
      // Update local state without refetching
      setVerifications(prev => 
        prev.map(v => v.verification_id === id ? {...v, status, rejected_reason: rejectedReason} : v)
      );
      
      setMessage({ text: `Verification ${status.toLowerCase()}ed successfully`, type: "success" });
      setLoading(false);
    } catch (error) {
      setMessage({ text: error.message || `Failed to ${status.toLowerCase()} verification`, type: "error" });
      setLoading(false);
    }
  };

  const handleUpdateUserRole = async (email) => {
    if (!editRole) {
      setMessage({ text: "Please select a role", type: "error" });
      return;
    }

    try {
      setLoading(true);
      const updatedUser = await updateUserRole(email, editRole);
      console.log('Updated user data:', updatedUser);
      
      // Update local state with the response data if available, otherwise use the edited role
      setUsers(prev => 
        prev.map(u => (u.email || u.user_email) === email ? {
          ...u, 
          role: updatedUser?.role || editRole
        } : u)
      );
      
      setEditingUser(null);
      setEditRole("");
      setMessage({ text: "User role updated successfully", type: "success" });
      
      // Refresh the user list to ensure we have the latest data
      try {
        const refreshedUsers = await getUsers();
        setUsers(refreshedUsers);
      } catch (refreshError) {
        console.error("Error refreshing user list:", refreshError);
        // Already updated the UI optimistically, so no need to show an error
      }
    } catch (error) {
      console.error("Error updating user role:", error);
      console.error("Error details:", error.response?.data || error.message);
      setMessage({ text: error.message || "Failed to update user role", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (email) => {
    if (!window.confirm(`Are you sure you want to delete user ${email}? This action cannot be undone.`)) {
      return;
    }
    
    try {
      setLoading(true);
      const result = await deleteUser(email);
      console.log('Delete user result:', result);
      
      // Update local state
      setUsers(prev => prev.filter(u => (u.email || u.user_email) !== email));
      setMessage({ text: "User deleted successfully", type: "success" });
      
      // Refresh the user list to ensure we have the latest data
      try {
        const refreshedUsers = await getUsers();
        setUsers(refreshedUsers);
      } catch (refreshError) {
        console.error("Error refreshing user list after deletion:", refreshError);
        // Already updated the UI optimistically, so no need to show an error
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      console.error("Error details:", error.response?.data || error.message);
      setMessage({ text: error.response?.data?.error || error.message || "Failed to delete user", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleApproveCampaign = async (id) => {
    try {
      setLoading(true);
      await updateCampaignStatus(id, "APPROVED");
      // Update local state
      setCampaigns(prev => 
        prev.map(c => c.id === id ? {...c, status: "APPROVED"} : c)
      );
      setMessage({ text: "Campaign approved successfully", type: "success" });
    } catch (error) {
      setMessage({ text: error.message || "Failed to approve campaign", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVerification = async (id) => {
    if (!confirm("Are you sure you want to delete this verification? This action cannot be undone.")) {
      return;
    }
    
    try {
      setLoading(true);
      await deleteVerification(id);
      
      // Update local state without refetching
      setVerifications(prev => prev.filter(v => v.verification_id !== id));
      
      setMessage({ text: "Verification deleted successfully", type: "success" });
      setLoading(false);
    } catch (error) {
      setMessage({ text: error.message || "Failed to delete verification", type: "error" });
      setLoading(false);
    }
  };

  const handleDeactivateCampaign = async (id, reason = '') => {
    try {
      setLoading(true);
      await updateCampaignStatus(id, "INACTIVE", reason);
      // Update local state
      setCampaigns(prev => 
        prev.map(c => c.id === id ? {...c, status: "INACTIVE"} : c)
      );
      setMessage({ text: "Campaign deactivated successfully", type: "success" });
      setLoading(false);
    } catch (error) {
      setMessage({ text: error.message || "Failed to deactivate campaign", type: "error" });
      setLoading(false);
    }
  };

  const toggleProfileDropdown = () => {
    setShowProfileDropdown(!showProfileDropdown);
  };

  return (
    <div className="container">
      <div className="admin-header">
        <h2>Admin Dashboard</h2>
        
        {adminData && (
          <div className="admin-profile">
            <div className="profile-icon" onClick={toggleProfileDropdown}>
              <img src={adminData.profileImage} alt="Admin Profile" />
            </div>
            
            {showProfileDropdown && (
              <div className="profile-dropdown" ref={profileDropdownRef}>
                <div className="profile-header">
                  <img src={adminData.profileImage} alt="Admin Profile" />
                  <div>
                    <h3>{adminData.name}</h3>
                    <p className="role">{adminData.role}</p>
                  </div>
                </div>
                <div className="profile-details">
                  <div className="detail-item">
                    <span className="label">Email:</span>
                    <span className="value">{adminData.email}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Joined:</span>
                    <span className="value">{adminData.joinDate}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Last Login:</span>
                    <span className="value">{adminData.lastLogin}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Permissions:</span>
                    <div className="permissions-list">
                      {adminData.permissions.map((permission, index) => (
                        <span key={index} className="permission-badge">{permission}</span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="profile-footer">
                  <button className="btn-outline">Logout</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      {message.text && (
        <div className={`alert ${message.type === "error" ? "alert-danger" : "alert-success"}`}>
          {message.text}
          <button className="close-btn" onClick={() => setMessage({ text: "", type: "" })}>×</button>
        </div>
      )}

      <div className="tabs">
        <button 
          className={`tab-btn ${activeTab === "users" ? "active" : ""}`}
          onClick={() => setActiveTab("users")}
        >
          Manage Users
        </button>
        <button 
          className={`tab-btn ${activeTab === "verifications" ? "active" : ""}`}
          onClick={() => setActiveTab("verifications")}
        >
          NGO Verifications
        </button>
        <button 
          className={`tab-btn ${activeTab === "campaigns" ? "active" : ""}`}
          onClick={() => setActiveTab("campaigns")}
        >
          Campaign Moderation
        </button>
      </div>

      {activeTab === "users" && (
        <section className="card">
          <h3>User Management</h3>
          {loading ? (
            <p className="muted">Loading users...</p>
          ) : (
            <div className="table">
              <div className="table-row table-head">
                <div>Email</div>
                <div>Role</div>
                <div>Verified</div>
                <div>Actions</div>
              </div>
              {users.length === 0 ? (
                <p className="muted">No users found.</p>
              ) : (
                users.map((u, i) => (
                  <div key={i} className="table-row">
                    <div>{u.email || u.user_email}</div>
                    <div>
                      {editingUser === (u.email || u.user_email) ? (
                        <select 
                          value={editRole} 
                          onChange={(e) => setEditRole(e.target.value)}
                          className="select-input"
                        >
                          <option value="">Select Role</option>
                          <option value="DONOR">DONOR</option>
                          <option value="NGO">NGO</option>
                          <option value="ADMIN">ADMIN</option>
                        </select>
                      ) : (
                        u.role || u.user_role
                      )}
                    </div>
                    <div>
                      <span className={`status-badge ${u.is_verified ? 'status-approved' : 'status-rejected'}`}>
                        {u.is_verified ? 'Verified' : 'Not Verified'}
                      </span>
                    </div>
                    <div className="row gap">
                      {editingUser === (u.email || u.user_email) ? (
                        <>
                          <button 
                            className="btn btn-sm btn-success" 
                            onClick={() => handleUpdateUserRole(u.email || u.user_email)}
                            disabled={loading}
                          >
                            Save
                          </button>
                          <button 
                            className="btn btn-sm btn-outline" 
                            onClick={() => {
                              setEditingUser(null);
                              setEditRole("");
                            }}
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button 
                            className="btn btn-sm btn-outline" 
                            onClick={() => {
                              setEditingUser(u.email || u.user_email);
                              setEditRole(u.role || u.user_role);
                            }}
                          >
                            Edit Role
                          </button>
                          <button 
                            className="btn btn-sm btn-danger" 
                            onClick={() => handleDeleteUser(u.email || u.user_email)}
                            disabled={loading}
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </section>
      )}

      {activeTab === "verifications" && (
        <section className="card">
          <h3>NGO Verification Requests</h3>
          {loading ? (
            <p className="muted">Loading verification requests...</p>
          ) : verifications.length === 0 ? (
            <p className="muted">No verification requests found.</p>
          ) : (
            <div className="table">
              <div className="table-row table-head">
                <div>Email</div>
                <div>Status</div>
                <div>Documents</div>
                <div>Actions</div>
              </div>
              {verifications.map((v, i) => (
                <div key={i} className="table-row">
                  <div>{v.email}</div>
                  <div>
                    <span className={`status-badge ${v.status.toLowerCase()}`}>
                      {v.status}
                    </span>
                  </div>
                  <div className="documents-cell">
                    {v.files && v.files.length > 0 ? (
                      v.files.map((file, index) => (
                        <a 
                          key={file.file_id || index}
                          href={file.file_path || '#'} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className={`doc-link ${!file.file_path ? 'doc-missing' : ''}`}
                          onClick={(e) => {
                            if (!file.file_path) {
                              e.preventDefault();
                              alert('Document link is not available');
                              return;
                            }
                            markDocumentViewed(v.verification_id, file.file_type);
                          }}
                        >
                          {getDocumentLabel(file.file_type)}
                          {!file.file_path && ' (Not Available)'}
                        </a>
                      ))
                    ) : v.documents && v.documents.length > 0 ? (
                      v.documents.map((doc, index) => (
                        <a 
                          key={doc.id || index}
                          href={doc.url || '#'} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className={`doc-link ${!doc.url ? 'doc-missing' : ''}`}
                          onClick={(e) => {
                            if (!doc.url) {
                              e.preventDefault();
                              alert('Document link is not available');
                              return;
                            }
                            markDocumentViewed(v.verification_id, doc.type || 'DOCUMENT');
                          }}
                        >
                          {getDocumentLabel(doc.type) || `Document ${index + 1}`}
                          {!doc.url && ' (Not Available)'}
                        </a>
                      ))
                    ) : (
                      // Check for legacy document structure
                      v.ngo_registration_doc || v.pan_card || v.bank_proof || v.id_proof ? (
                        <>
                          {v.ngo_registration_doc && (
                            <a 
                              href={v.ngo_registration_doc || '#'} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className={`doc-link ${!v.ngo_registration_doc ? 'doc-missing' : ''}`}
                              onClick={(e) => {
                                if (!v.ngo_registration_doc) {
                                  e.preventDefault();
                                  alert('Document link is not available');
                                  return;
                                }
                                markDocumentViewed(v.verification_id, 'NGO_REGISTRATION');
                              }}
                            >
                              Registration Doc
                              {!v.ngo_registration_doc && ' (Not Available)'}
                            </a>
                          )}
                          {v.pan_card && (
                            <a 
                              href={v.pan_card || '#'} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className={`doc-link ${!v.pan_card ? 'doc-missing' : ''}`}
                              onClick={(e) => {
                                if (!v.pan_card) {
                                  e.preventDefault();
                                  alert('Document link is not available');
                                  return;
                                }
                                markDocumentViewed(v.verification_id, 'PAN');
                              }}
                            >
                              PAN Card
                              {!v.pan_card && ' (Not Available)'}
                            </a>
                          )}
                          {v.bank_proof && (
                            <a 
                              href={v.bank_proof || '#'} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className={`doc-link ${!v.bank_proof ? 'doc-missing' : ''}`}
                              onClick={(e) => {
                                if (!v.bank_proof) {
                                  e.preventDefault();
                                  alert('Document link is not available');
                                  return;
                                }
                                markDocumentViewed(v.verification_id, 'BANK_PROOF');
                              }}
                            >
                              Bank Proof
                              {!v.bank_proof && ' (Not Available)'}
                            </a>
                          )}
                          {v.id_proof && (
                            <a 
                              href={v.id_proof || '#'} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className={`doc-link ${!v.id_proof ? 'doc-missing' : ''}`}
                              onClick={(e) => {
                                if (!v.id_proof) {
                                  e.preventDefault();
                                  alert('Document link is not available');
                                  return;
                                }
                                markDocumentViewed(v.verification_id, 'ID_PROOF');
                              }}
                            >
                              ID Proof
                              {!v.id_proof && ' (Not Available)'}
                            </a>
                          )}
                        </>
                      ) : (
                        <span className="doc-missing">No Documents Available</span>
                      )
                    )}
                  </div>
                  <div className="verification-actions">
                    {/* Approve Button - Always present but conditionally enabled */}
                    <button 
                      className="btn btn-sm btn-success" 
                      onClick={() => handleUpdateVerification(v.verification_id, "APPROVED")}
                      disabled={loading || v.status === "APPROVED" || (v.status === "PENDING" && (getDocumentCount(v) === 0 || !hasViewedRequiredDocuments(v.verification_id)))}
                      style={{ visibility: v.status === "APPROVED" ? "hidden" : "visible" }}
                      title={getDocumentCount(v) === 0 ? "No documents available" : v.status === "PENDING" && !hasViewedRequiredDocuments(v.verification_id) ? "View at least one document before approving" : ""}
                    >
                      Approve
                    </button>
                    
                    {/* Reject Button - Always present but conditionally enabled */}
                    <button 
                      className="btn btn-sm btn-danger" 
                      onClick={() => {
                        const reason = prompt(v.status === "APPROVED" ? 
                          "Please enter a reason for revoking approval:" : 
                          "Please enter a reason for rejection:");
                        if (reason) {
                          handleUpdateVerification(v.verification_id, "REJECTED", reason);
                        }
                      }}
                      disabled={loading || v.status === "REJECTED" || (v.status === "PENDING" && (getDocumentCount(v) === 0 || !hasViewedRequiredDocuments(v.verification_id)))}
                      style={{ visibility: v.status === "REJECTED" ? "hidden" : "visible" }}
                      title={getDocumentCount(v) === 0 ? "No documents available" : v.status === "PENDING" && !hasViewedRequiredDocuments(v.verification_id) ? "View at least one document before rejecting" : ""}
                    >
                      {v.status === "APPROVED" ? "Revoke Approval" : "Reject"}
                    </button>
                    
                    {/* Delete Button - Always present */}
                    <button 
                      className="btn btn-sm btn-outline" 
                      onClick={() => handleDeleteVerification(v.verification_id)}
                      disabled={loading}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {activeTab === "campaigns" && (
        <section className="card">
          <h3>Campaign Moderation</h3>
          {loading ? (
            <p className="muted">Loading campaigns...</p>
          ) : campaigns.length === 0 ? (
            <p className="muted">No campaigns found.</p>
          ) : (
            campaigns.map((c) => (
              <div key={c.id} className="row spread center list-item">
                <div>
                  <strong>{c.title}</strong>
                  <div className="muted">NGO: {c.ngoName || "N/A"}</div>
                  {c.status && (
                    <span className={`status-badge ${(c.status || "").toLowerCase()}`}>
                      {c.status}
                    </span>
                  )}
                </div>
                <div className="row gap">
                  <button 
                    className="btn btn-sm btn-success" 
                    onClick={() => handleUpdateCampaignStatus(c.id, "APPROVED")}
                    disabled={loading || c.status === "APPROVED"}
                    style={{ visibility: c.status === "APPROVED" ? "hidden" : "visible" }}
                  >
                    Approve
                  </button>
                  <button 
                    className="btn btn-sm btn-danger" 
                    onClick={() => {
                      if (c.status === "APPROVED") {
                        if (confirm("Are you sure you want to deactivate this campaign?")) {
                          const reason = prompt("Please provide a reason for deactivation:");
                          handleUpdateCampaignStatus(c.id, "INACTIVE", reason);
                        }
                      } else {
                        if (confirm("Are you sure you want to reject this campaign?")) {
                          const reason = prompt("Please provide a reason for rejection:");
                          handleUpdateCampaignStatus(c.id, "REJECTED", reason);
                        }
                      }
                    }}
                    disabled={loading || c.status === "REJECTED" || c.status === "INACTIVE"}
                  >
                    {c.status === "APPROVED" ? "Deactivate" : "Reject"}
                  </button>
                  <button
                    className="btn btn-sm btn-secondary"
                    onClick={() => {
                      if (confirm("Are you sure you want to delete this campaign? This action cannot be undone.")) {
                        try {
                          setLoading(true);
                          deleteCampaign(c.id)
                            .then(() => {
                              // Update local state
                              setCampaigns(prev => prev.filter(camp => camp.id !== c.id));
                              setMessage({ text: "Campaign deleted successfully", type: "success" });
                            })
                            .catch(error => {
                              setMessage({ text: error.message || "Failed to delete campaign", type: "error" });
                            })
                            .finally(() => {
                              setLoading(false);
                            });
                        } catch (error) {
                          setMessage({ text: error.message || "Failed to delete campaign", type: "error" });
                          setLoading(false);
                        }
                      }
                    }}
                    disabled={loading}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          
          )}
        </section>
      )}
    </div>
  );
}
