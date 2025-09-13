import { useEffect, useState } from "react";
import client from "../api/client";

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [campaigns, setCampaigns] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const u = await client.get("/api/user/users");
        setUsers(Array.isArray(u.data) ? u.data : []);
      } catch { setUsers([]); }

      try {
        const c = await client.get("/api/campaigns");
        setCampaigns(Array.isArray(c.data) ? c.data : []);
      } catch { setCampaigns([]); }
    })();
  }, []);

  return (
    <div className="container">
      <h2>Admin Dashboard</h2>

      <section className="card">
        <h3>Users</h3>
        <div className="table">
          <div className="table-row table-head">
            <div>Email</div><div>Role</div><div>Verified</div>
          </div>
          {users.map((u, i)=>(
            <div key={i} className="table-row">
              <div>{u.email || u.user_email}</div>
              <div>{u.role || u.user_role}</div>
              <div>{String(u.isVerified ?? u.verified ?? false)}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="card">
        <h3>Campaign Moderation</h3>
        {campaigns.length === 0 && <p className="muted">No campaigns yet.</p>}
        {campaigns.map((c)=>(
          <div key={c.id} className="row spread center list-item">
            <div><strong>{c.title}</strong><div className="muted">NGO: {c.ngoName || "N/A"}</div></div>
            <div className="row gap">
              <button className="btn btn-sm btn-outline">Approve</button>
              <button className="btn btn-sm">Deactivate</button>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
