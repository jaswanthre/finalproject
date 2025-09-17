
import { useEffect, useState, useRef } from "react";
import "./AdminDashboard.css";
import { useAuth } from "../context/AuthContext";

export default function AdminDashboard() {
  const { user } = useAuth();

  // User, Verification, Campaign, Donation, Transaction Data States
  const [users, setUsers] = useState([]);
  const [verifications, setVerifications] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [donations, setDonations] = useState([]);
  const [transactions, setTransactions] = useState([]);

  const [activeTab, setActiveTab] = useState("users");
  const [editingUser, setEditingUser] = useState(null);
  const [editRole, setEditRole] = useState("");
  const [editingCampaign, setEditingCampaign] = useState(null);
  const [editCampaignData, setEditCampaignData] = useState({});
  const [editingDonation, setEditingDonation] = useState(null);
  const [editDonationData, setEditDonationData] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const profileDropdownRef = useRef(null);

  // Add User Form
  const [showAddUserForm, setShowAddUserForm] = useState(false);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    roleId: "",
  });

  // Role Filter State
  const [filterRole, setFilterRole] = useState("all");
  const roleMap = {
    1: "ADMIN",
    2: "NGO",
    3: "DONOR",
  };

  // Donation & Transaction Filter States
  const [donationFilter, setDonationFilter] = useState("all");
  const [transactionFilter, setTransactionFilter] = useState("all");
  const [transactionDateFilter, setTransactionDateFilter] = useState("");

  const getHeaders = () => {
    return user?.token ? { Authorization: `Bearer ${user.token}` } : {};
  };

  // Fetch Data Helpers
  const fetchData = async () => {
    setLoading(true);
    try {
      const verifRes = await fetch(
        "http://localhost:5000/api/users/verifications",
        { headers: getHeaders() }
      );
      const verifJson = await verifRes.json();
      setVerifications(verifJson.verifications || []);

      const userRes = await fetch(
        "http://localhost:5000/api/users/admin/users",
        { headers: getHeaders() }
      );
      const userJson = await userRes.json();
      setUsers(userJson.users || []);
    } catch (err) {
      setMessage({ text: err.message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        "http://localhost:5000/api/campaigns/campaign/campaigns",
        { headers: getHeaders() }
      );
      const data = await res.json();
      setCampaigns(data || []);
    } catch (err) {
      setMessage({ text: err.message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const fetchDonations = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/donors/donation", {
        headers: getHeaders(),
      });
      const data = await res.json();
      setDonations(data || []);
    } catch (err) {
      setMessage({ text: err.message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/donors/transaction", {
        headers: getHeaders(),
      });
      const data = await res.json();
      setTransactions(data || []);
    } catch (err) {
      setMessage({ text: err.message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    if (activeTab === "campaigns") {
      fetchCampaigns();
    } else if (activeTab === "donations") {
      fetchDonations();
    } else if (activeTab === "transactions") {
      fetchTransactions();
    }
  }, [activeTab]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target) &&
        !event.target.closest(".profile-icon")
      ) {
        setShowProfileDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // User actions
  const handleUpdateUserRole = async (email) => {
    try {
      setLoading(true);
      await fetch("http://localhost:5000/api/users/admin/user/role", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...getHeaders(),
        },
        body: JSON.stringify({ email, roleId: Number(editRole) }),
      });
      fetchData();
      setEditingUser(null);
      setEditRole("");
      setMessage({ text: "User role updated", type: "success" });
    } catch (err) {
      setMessage({ text: err.message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (email) => {
    if (!window.confirm(`Delete user ${email}?`)) return;
    try {
      setLoading(true);
      await fetch("http://localhost:5000/api/users/admin/user", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...getHeaders(),
        },
        body: JSON.stringify({ email }),
      });
      fetchData();
      setMessage({ text: "User deleted", type: "success" });
    } catch (err) {
      setMessage({ text: err.message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  // Verification actions
  const handleUpdateVerification = async (email, status) => {
    const feedback =
      status === "REJECTED" ? prompt("Enter rejection feedback:") : "Approved";
    try {
      setLoading(true);
      await fetch(
        `http://localhost:5000/api/users/verifications/status/${email}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...getHeaders(),
          },
          body: JSON.stringify({ status, feedback }),
        }
      );
      fetchData();
      setMessage({ text: `Verification ${status}`, type: "success" });
    } catch (err) {
      setMessage({ text: err.message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVerification = async (email) => {
    if (!window.confirm("Delete verification?")) return;
    try {
      setLoading(true);
      await fetch(`http://localhost:5000/api/users/verifications/${email}`, {
        method: "DELETE",
        headers: { ...getHeaders() },
      });
      fetchData();
      setMessage({ text: "Verification deleted", type: "success" });
    } catch (err) {
      setMessage({ text: err.message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  // Add user
  const handleAddUser = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:5000/api/users/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getHeaders(),
        },
        body: JSON.stringify(newUser),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ text: "User added successfully", type: "success" });
        fetchData();
        setShowAddUserForm(false);
        setNewUser({ name: "", email: "", password: "", roleId: "" });
      } else {
        setMessage({ text: data.message || "Failed to add user", type: "error" });
      }
    } catch (err) {
      setMessage({ text: err.message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  // Campaign actions
  const handleDeleteCampaign = async (campaignId) => {
    if (!window.confirm("Delete this campaign?")) return;
    setLoading(true);
    try {
      await fetch(
        `http://localhost:5000/api/campaigns/campaign/campaigns/${campaignId}`,
        {
          method: "DELETE",
          headers: getHeaders(),
        }
      );
      fetchCampaigns();
      setMessage({ text: "Campaign deleted", type: "success" });
    } catch (err) {
      setMessage({ text: err.message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleEditCampaign = (campaignId) => {
    const campaign = campaigns.find((c) => c.campaign_id === campaignId);
    setEditingCampaign(campaignId);
    setEditCampaignData({ ...campaign });
  };

  const handleSaveCampaignEdit = async () => {
    setLoading(true);
    try {
      await fetch(
        `http://localhost:5000/api/campaigns/campaign/campaigns/${editingCampaign}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...getHeaders(),
          },
          body: JSON.stringify(editCampaignData),
        }
      );
      fetchCampaigns();
      setEditingCampaign(null);
      setMessage({ text: "Campaign updated", type: "success" });
    } catch (err) {
      setMessage({ text: err.message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  // Donation actions
  const handleDeleteDonation = async (donationId) => {
    if (!window.confirm("Delete this donation?")) return;
    setLoading(true);
    try {
      await fetch(`http://localhost:5000/api/donors/donation/${donationId}`, {
        method: "DELETE",
        headers: getHeaders(),
      });
      fetchDonations();
      setMessage({ text: "Donation deleted", type: "success" });
    } catch (err) {
      setMessage({ text: err.message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleEditDonation = (donationId) => {
    const donation = donations.find((d) => d.donation_id === donationId);
    setEditingDonation(donationId);
    setEditDonationData({ ...donation });
  };

  const handleSaveDonationEdit = async () => {
    setLoading(true);
    try {
      await fetch(
        `http://localhost:5000/api/donors/donation/${editingDonation}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...getHeaders(),
          },
          body: JSON.stringify({ payment_status: editDonationData.payment_status }),
        }
      );
      fetchDonations();
      setEditingDonation(null);
      setMessage({ text: "Donation payment status updated", type: "success" });
    } catch (err) {
      setMessage({ text: err.message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  // Filter donations based on donationFilter state
  const filteredDonations = donations.filter((d) => {
    if (donationFilter === "all") return true;
    return d.payment_status === donationFilter.toUpperCase();
  });

  // Filter transactions based on status and date
  const filteredTransactions = transactions.filter((t) => {
    const statusMatch = transactionFilter === "all" || t.transaction_status === transactionFilter.toUpperCase();

    let dateMatch = true;
    if (transactionDateFilter) {
      const txnDate = new Date(t.transaction_date).toISOString().slice(0, 10);
      dateMatch = txnDate === transactionDateFilter;
    }

    return statusMatch && dateMatch;
  });

  return (
    <div className="container">
      <div className="admin-header">
        <h2>Admin Dashboard</h2>
      </div>
      {message.text && (
        <div
          className={`alert ${
            message.type === "error" ? "alert-danger" : "alert-success"
          }`}
        >
          {message.text}
          <button
            className="close-btn"
            onClick={() => setMessage({ text: "", type: "" })}
          >
            ×
          </button>
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
          Manage Campaigns
        </button>
        <button
          className={`tab-btn ${activeTab === "donations" ? "active" : ""}`}
          onClick={() => setActiveTab("donations")}
        >
          Manage Donations
        </button>
        <button
          className={`tab-btn ${activeTab === "transactions" ? "active" : ""}`}
          onClick={() => setActiveTab("transactions")}
        >
          Manage Transactions
        </button>
      </div>

      {/* USERS TAB */}
      {activeTab === "users" && (
        <section className="card">
          <div className="user-header-card">
            <span className="manage-user">User Management</span>
            <button
              className="btn btn-sm btn-success"
              style={{ marginBottom: "1rem" }}
              onClick={() => setShowAddUserForm(true)}
            >
              Add User
            </button>
          </div>
          <div className="filter-container" style={{ marginBottom: "1rem" }}>
            <label htmlFor="role-filter">Filter by Role:</label>
            <select
              id="role-filter"
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="select-input"
              style={{ marginLeft: "0.5rem" }}
            >
              <option value="all">All</option>
              <option value="1">Admin</option>
              <option value="2">NGO</option>
              <option value="3">Donor</option>
            </select>
          </div>
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
              {(() => {
                const filteredUsers = users
                  .filter(
                    (u) => filterRole === "all" || String(u.role_id) === filterRole
                  )
                  .slice()
                  .reverse();
                return filteredUsers.length === 0 ? (
                  <p className="muted">No users found.</p>
                ) : (
                  filteredUsers.map((u, i) => (
                    <div key={i} className="table-row">
                      <div>{u.email}</div>
                      <div>
                        {editingUser === u.email ? (
                          <select
                            value={editRole}
                            onChange={(e) => setEditRole(e.target.value)}
                            className="select-input"
                          >
                            <option value="">Select Role</option>
                            <option value={3}>DONOR</option>
                            <option value={2}>NGO</option>
                            <option value={1}>ADMIN</option>
                          </select>
                        ) : (
                          roleMap[u.role_id] || "Unknown"
                        )}
                      </div>
                      <div>
                        <span
                          className={`status-badge ${
                            u.role_id === 2
                              ? u.is_verified
                                ? "status-approved"
                                : "status-rejected"
                              : ""
                          }`}
                        >
                          {u.role_id === 2
                            ? u.is_verified
                              ? "Verified"
                              : "Not Verified"
                            : "—"}
                        </span>
                      </div>
                      <div className="row gap">
                        {editingUser === u.email ? (
                          <>
                            <button
                              className="btn btn-sm btn-success"
                              onClick={() => handleUpdateUserRole(u.email)}
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
                                setEditingUser(u.email);
                                setEditRole(u.role_id);
                              }}
                            >
                              Edit Role
                            </button>
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => handleDeleteUser(u.email)}
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))
                );
              })()}
            </div>
          )}
        </section>
      )}

      {/* VERIFICATIONS TAB */}
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
                <div>Feedback</div>
                <div>Documents</div>
                <div>Actions</div>
              </div>
              {verifications.slice().reverse().map((v, i) => (
                <div key={i} className="table-row">
                  <div>{v.email}</div>
                  <div>
                    <span className={`status-badge ${v.status.toLowerCase()}`}>
                      {v.status}
                    </span>
                  </div>
                  <div>{v.feedback || "—"}</div>
                  <div className="documents-cell">
                    {v.ngo_registration_doc && (
                      <a
                        href={v.ngo_registration_doc}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="doc-link"
                      >
                        Ngo Registration Doc
                      </a>
                    )}
                    {v.pan_card && (
                      <a
                        href={v.pan_card}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="doc-link"
                      >
                        PAN Card Doc
                      </a>
                    )}
                    {v.bank_proof && (
                      <a
                        href={v.bank_proof}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="doc-link"
                      >
                        Bank Proof
                      </a>
                    )}
                    {v.id_proof && (
                      <a
                        href={v.id_proof}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="doc-link"
                      >
                        ID Proof
                      </a>
                    )}
                  </div>
                  <div className="verification-actions">
                    <button
                      className="btn btn-sm btn-success"
                      onClick={() => handleUpdateVerification(v.email, "APPROVED")}
                      disabled={loading || v.status === "APPROVED"}
                    >
                      Approve
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleUpdateVerification(v.email, "REJECTED")}
                      disabled={loading || v.status === "REJECTED"}
                    >
                      Reject
                    </button>
                    <button
                      className="btn btn-sm btn-outline"
                      onClick={() => handleDeleteVerification(v.email)}
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

      {/* CAMPAIGNS TAB */}
      {activeTab === "campaigns" && (
        <section className="card">
          <h3>Manage Campaigns</h3>
          {loading ? (
            <p className="muted">Loading campaigns...</p>
          ) : campaigns.length === 0 ? (
            <p className="muted">No campaigns found.</p>
          ) : (
            <div className="table">
              <div className="table-row table-head">
                <div>Title</div>
                <div>NGO</div>
                <div>Status</div>
                <div>City</div>
                <div>Target Amount</div>
                <div>Raised Amount</div>
                <div>Actions</div>
              </div>
              {campaigns.slice().reverse().map((c, i) => (
                <div key={c.campaign_id} className="table-row">
                  <div>{c.title}</div>
                  <div>{c.ngo_email}</div>
                  <div>
                    <span className={`status-badge ${c.status.toLowerCase()}`}>
                      {c.status}
                    </span>
                  </div>
                  <div>{c.city}</div>
                  <div>₹ {Number(c.target_amount).toLocaleString()}</div>
                  <div>₹ {Number(c.raised_amount).toLocaleString()}</div>
                  <div className="row gap">
                    <button
                      className="btn btn-sm btn-outline"
                      onClick={() => handleEditCampaign(c.campaign_id)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDeleteCampaign(c.campaign_id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {editingCampaign && (
            <div className="modal-overlay">
              <div className="modal">
                <h3>Edit Campaign</h3>
                <input
                  className="textarea-input"
                  type="text"
                  value={editCampaignData.title}
                  onChange={(e) =>
                    setEditCampaignData({ ...editCampaignData, title: e.target.value })
                  }
                  placeholder="Campaign Title"
                />
                <input
                  className="textarea-input"
                  type="text"
                  value={editCampaignData.city}
                  onChange={(e) =>
                    setEditCampaignData({ ...editCampaignData, city: e.target.value })
                  }
                  placeholder="City"
                />
                <input
                  className="textarea-input"
                  type="number"
                  value={editCampaignData.target_amount}
                  onChange={(e) =>
                    setEditCampaignData({ ...editCampaignData, target_amount: e.target.value })
                  }
                  placeholder="Target Amount"
                />
                <input
                  className="textarea-input"
                  type="text"
                  value={editCampaignData.status}
                  onChange={(e) =>
                    setEditCampaignData({ ...editCampaignData, status: e.target.value })
                  }
                  placeholder="Status"
                />
                <textarea
                  className="textarea-input"
                  value={editCampaignData.description}
                  onChange={(e) =>
                    setEditCampaignData({ ...editCampaignData, description: e.target.value })
                  }
                  placeholder="Description"
                ></textarea>
                <div className="modal-actions">
                  <button
                    className="btn btn-success"
                    onClick={handleSaveCampaignEdit}
                    disabled={loading}
                  >
                    Save Changes
                  </button>
                  <button
                    className="btn btn-outline"
                    onClick={() => setEditingCampaign(null)}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>
      )}

      {/* DONATIONS TAB */}
      {activeTab === "donations" && (
        <section className="card">
          <h3>Manage Donations</h3>
          <div className="filter-container" style={{ marginBottom: "1rem" }}>
            <label htmlFor="donation-filter">Filter by Payment Status:</label>
            <select
              id="donation-filter"
              value={donationFilter}
              onChange={(e) => setDonationFilter(e.target.value)}
              className="select-input"
              style={{ marginLeft: "0.5rem" }}
            >
              <option value="all">All Donations</option>
              <option value="SUCCESS">Success Donations</option>
              <option value="FAILED">Failed Donations</option>
              <option value="PENDING">Pending Donations</option>
            </select>
          </div>
          {loading ? (
            <p className="muted">Loading donations...</p>
          ) : filteredDonations.length === 0 ? (
            <p className="muted">No donations found.</p>
          ) : (
            <div className="table">
              <div className="table-row table-head">
                <div>Donor Email</div>
                <div>Campaign Title</div>
                <div>Amount</div>
                <div>Payment Method</div>
                <div>Payment Status</div>
                <div>Donation Date</div>
                <div>Actions</div>
              </div>
              {filteredDonations.map((d) => (
                <div key={d.donation_id} className="table-row">
                  <div>{d.donor_email}</div>
                  <div>{d.campaign_title || "N/A"}</div>
                  <div>₹ {Number(d.amount).toFixed(2)}</div>
                  <div>{d.payment_method}</div>
                  <div>
                    {editingDonation === d.donation_id ? (
                      <select
                        value={editDonationData.payment_status}
                        onChange={(e) =>
                          setEditDonationData({
                            ...editDonationData,
                            payment_status: e.target.value,
                          })
                        }
                        className="select-input"
                      >
                        <option value="PENDING">PENDING</option>
                        <option value="SUCCESS">SUCCESS</option>
                        <option value="FAILED">FAILED</option>
                      </select>
                    ) : (
                      d.payment_status
                    )}
                  </div>
                  <div>{new Date(d.created_at).toLocaleString()}</div>
                  <div className="row gap">
                    {editingDonation === d.donation_id ? (
                      <>
                        <button
                          className="btn btn-sm btn-success"
                          onClick={handleSaveDonationEdit}
                        >
                          Save
                        </button>
                        <button
                          className="btn btn-sm btn-outline"
                          onClick={() => {
                            setEditingDonation(null);
                            setEditDonationData({});
                          }}
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          className="btn btn-sm btn-outline"
                          onClick={() => handleEditDonation(d.donation_id)}
                        >
                          Edit Status
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDeleteDonation(d.donation_id)}
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* TRANSACTIONS TAB */}
      {activeTab === "transactions" && (
        <section className="card">
          <h3>Manage Transactions</h3>
          <div
            className="filter-container"
            style={{ marginBottom: "1rem", gap: "1rem", flexWrap: "wrap" }}
          >
            {/* Transaction Status Filter */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <label htmlFor="transaction-filter">Filter by Status:</label>
              <select
                id="transaction-filter"
                value={transactionFilter}
                onChange={(e) => setTransactionFilter(e.target.value)}
                className="select-input"
                style={{ minWidth: "180px" }}
              >
                <option value="all">All Transactions</option>
                <option value="SUCCESS">Success Transactions</option>
                <option value="FAILED">Failed Transactions</option>
                <option value="PENDING">Pending Transactions</option>
              </select>
            </div>

            {/* Transaction Date Filter */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <label htmlFor="transaction-date-filter">Filter by Date:</label>
              <input
                type="date"
                id="transaction-date-filter"
                value={transactionDateFilter}
                onChange={(e) => setTransactionDateFilter(e.target.value)}
                className="select-input"
                style={{ minWidth: "180px" }}
              />
              {transactionDateFilter && (
                <button
                  className="btn btn-outline"
                  onClick={() => setTransactionDateFilter("")}
                >
                  Clear Date
                </button>
              )}
            </div>
          </div>

          {loading ? (
            <p className="muted">Loading transactions...</p>
          ) : filteredTransactions.length === 0 ? (
            <p className="muted">No transactions found.</p>
          ) : (
            <div className="table">
              <div className="table-row table-head">
                <div>Transaction ID</div>
                <div>Donation ID</div>
                <div>Date</div>
                <div>Amount</div>
                <div>Gateway</div>
                <div>Status</div>
              </div>
              {filteredTransactions.map((t) => (
                <div key={t.transaction_id} className="table-row">
                  <div>{t.transaction_id}</div>
                  <div>{t.donation_id}</div>
                  <div>{new Date(t.transaction_date).toLocaleString()}</div>
                  <div>₹ {Number(t.transaction_amount).toFixed(2)}</div>
                  <div>{t.payment_gateway || "N/A"}</div>
                  <div>
                    <span className={`status-badge ${t.transaction_status.toLowerCase()}`}>
                      {t.transaction_status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Add User Modal */}
      {showAddUserForm && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Add New User</h3>
            <input
              type="text"
              placeholder="Name"
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              className="textarea-input"
            />
            <input
              type="email"
              placeholder="Email"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              className="textarea-input"
            />
            <input
              type="password"
              placeholder="Password"
              value={newUser.password}
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              className="textarea-input"
            />
            <select
              value={newUser.roleId}
              onChange={(e) => setNewUser({ ...newUser, roleId: Number(e.target.value) })}
              className="select-input"
            >
              <option value="">Select Role</option>
              <option value={1}>ADMIN</option>
              <option value={2}>NGO</option>
              <option value={3}>DONOR</option>
            </select>
            <div className="modal-actions">
              <button className="btn btn-success" onClick={handleAddUser} disabled={loading}>
                Add User
              </button>
              <button
                className="btn btn-outline"
                onClick={() => setShowAddUserForm(false)}
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
        </div>
      )}
    </div>
  );
}
