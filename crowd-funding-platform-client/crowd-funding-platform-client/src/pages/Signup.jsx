import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

export default function Signup() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    roleId: 3, // Default to Donor
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const payload = {
        name: form.name,
        email: form.email,
        password: form.password,
        roleId: parseInt(form.roleId), // Ensure it's a number
      };

      const res = await axios.post(
        "http://localhost:5000/api/users/auth/register",
        payload,
        { headers: { "Content-Type": "application/json" } }
      );

      if (res.status === 201 || res.status === 200) {
        if (payload.roleId === 2) navigate("/ngo", { replace: true });
        else if (payload.roleId === 1) navigate("/admin", { replace: true });
        else navigate("/donor", { replace: true });
      }
    } catch (err) {
      setError(
        err.response?.data?.error || "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <form className="card form auth-form animate-fade-in" onSubmit={onSubmit}>
        <h2>Join CrowdFund</h2>
        <p className="auth-subtitle">Create your account to start supporting causes</p>

        <label>
          Full Name
          <input
            type="text"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            placeholder="Enter your full name"
            required
          />
        </label>

        <label>
          Email
          <input
            type="email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            placeholder="Enter your email address"
            required
          />
        </label>

        <label>
          Password
          <input
            type="password"
            value={form.password}
            onChange={(e) => update("password", e.target.value)}
            placeholder="Create a secure password"
            required
          />
        </label>

        <label>
          I am a
          <select
            value={form.roleId}
            onChange={(e) => update("roleId", e.target.value)}
          >
            <option value={3}>Donor</option>
            <option value={2}>NGO</option>
          </select>
        </label>

        <button className="btn btn-primary" disabled={loading}>
          {loading ? (
            <span className="loading-spinner">Signing up...</span>
          ) : (
            "Create Account"
          )}
        </button>

        {error && <p className="error">{error}</p>}
        <p className="muted">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </form>
    </div>
  );
}
