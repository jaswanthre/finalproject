import { useState } from "react";
import client from "../api/client";

export default function CreateCampaign() {
  const [form, setForm] = useState({
    title: "", description: "", goalAmount: "", startDate: "", endDate: "", image:""
  });
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    if (!form.title || !form.description || !form.goalAmount || !form.startDate || !form.endDate) {
      setMsg("Please fill all fields.");
      return;
    }
    if (Number(form.goalAmount) <= 0) { setMsg("Goal must be greater than 0."); return; }

    setLoading(true);
    try {
      // await client.post("/api/campaigns", form);
      await new Promise((r)=>setTimeout(r, 600)); // demo
      setMsg("Campaign created (demo). Connect API to persist.");
      setForm({ title:"", description:"", goalAmount:"", startDate:"", endDate:"", image:"" });
    } catch (err) {
      setMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <form className="card form" onSubmit={onSubmit}>
        <h2>Create Campaign</h2>
        <label>Title
          <input value={form.title} onChange={(e)=>update("title", e.target.value)} required />
        </label>
        <label>Description
          <textarea rows="4" value={form.description} onChange={(e)=>update("description", e.target.value)} required />
        </label>
        <label>Goal Amount (₹)
          <input type="number" min="1" value={form.goalAmount} onChange={(e)=>update("goalAmount", e.target.value)} required />
        </label>
        <div className="row">
          <label>Start Date
            <input type="date" value={form.startDate} onChange={(e)=>update("startDate", e.target.value)} required />
          </label>
          <label>End Date
            <input type="date" value={form.endDate} onChange={(e)=>update("endDate", e.target.value)} required />
          </label>
        </div>
        <label>Image URL (mock upload)
          <input value={form.image} onChange={(e)=>update("image", e.target.value)} placeholder="https://..." />
        </label>
        <button className="btn" disabled={loading}>{loading ? "Saving..." : "Create"}</button>
        {msg && <p className="form-msg">{msg}</p>}
      </form>
    </div>
  );
}
