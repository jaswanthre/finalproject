import { useEffect, useState, useRef } from "react";
import "./AdminDashboard.css";
import { useAuth } from "../context/AuthContext";

export default function AdminDashboard() {
  const { user } = useAuth(); // comes from login context {token, email, role}
  const [users, setUsers] = useState([]);
  const [verifications, setVerifications] = useState([]);
  const [activeTab, setActiveTab] = useState("users");
  const [editingUser, setEditingUser] = useState(null);
  const [editRole, setEditRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const profileDropdownRef = useRef(null);

  // Role mapping
  const roleMap = {
    1: "ADMIN",
    2: "NGO",
    3: "DONOR",
  };

  // Token headers
  const getHeaders = () => {
    return user?.token ? { Authorization: `Bearer ${user.token}` } : {};
  };

  // Fetch users + verifications
  const fetchData = async () => {
    setLoading(true);
    try {
      // Verifications (admin only)
      const verifRes = await fetch(
        "http://localhost:5000/api/users/verifications",
        { headers: getHeaders() }
      );
      const verifJson = await verifRes.json();
      setVerifications(verifJson.verifications || []);

      // Users (admin only)
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

  useEffect(() => {
    fetchData();
  }, []);

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

  // ===== USER ACTIONS =====
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

  // ===== VERIFICATION ACTIONS =====
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

  // ===== UI =====
  return (
    <div className="container">
      <div className="admin-header">
        <h2>Admin Dashboard</h2>

        {user && (
          <div className="admin-profile">
            <div
              className="profile-icon"
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
            >
              <img
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                  user.email
                )}&background=0D8ABC&color=fff`}
                alt="Admin Profile"
              />
            </div>

            {showProfileDropdown && (
              <div className="profile-dropdown" ref={profileDropdownRef}>
                <div className="profile-header">
                  <img
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                      user.email
                    )}&background=0D8ABC&color=fff`}
                    alt="Admin Profile"
                  />
                  <div>
                    <h3>{user.email}</h3>
                    <p className="role">{roleMap[user.role] || "Unknown"}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Alerts */}
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

      {/* Tabs */}
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
      </div>

      {/* Users Section */}
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
                          u.is_verified ? "status-approved" : "status-rejected"
                        }`}
                      >
                        {u.is_verified ? "Verified" : "Not Verified"}
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
                              setEditRole(u.roleId);
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
              )}
            </div>
          )}
        </section>
      )}

      {/* Verifications Section */}
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

              {verifications.map((v, i) => (
                <div key={i} className="table-row">
                  {/* EMAIL */}
                  <div>{v.email}</div>

                  {/* STATUS */}
                  <div>
                    <span className={`status-badge ${v.status.toLowerCase()}`}>
                      {v.status}
                    </span>
                  </div>

                  {/* FEEDBACK */}
                  <div>{v.feedback || "—"}</div>

                  {/* DOCUMENT LINKS */}
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
                        Id_Proof
                      </a>
                    )}
                  </div>

                  {/* ACTION BUTTONS */}
                  <div className="verification-actions">
                    <button
                      className="btn btn-sm btn-success"
                      onClick={() =>
                        handleUpdateVerification(v.email, "APPROVED")
                      }
                      disabled={loading || v.status === "APPROVED"}
                    >
                      Approve
                    </button>

                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() =>
                        handleUpdateVerification(v.email, "REJECTED")
                      }
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
    </div>
  );
}
