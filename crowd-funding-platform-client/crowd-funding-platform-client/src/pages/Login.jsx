import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const nav = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);

    try {
      const res = await axios.post(
        "http://localhost:5000/api/users/auth/login",
        { email: form.email, password: form.password },
        { headers: { "Content-Type": "application/json" } }
      );

      if (res.data.success) {
        const { token, id, email, role, is_verified } = res.data;

        // Use AuthContext login function with proper user object structure
        login({ token, id, email, role, is_verified });

        // Navigate based on role (1 = Admin, 2 = NGO, 3 = Donor)
        console.log("Navigating to role:", role);

        // Add a small delay to ensure context is updated
        setTimeout(() => {
          if (role === 1) {
            nav("/admin", { replace: true });
          } else if (role === 2) {
            nav("/ngo", { replace: true });
          } else {
            nav("/donor", { replace: true });
          }
        }, 100);
      } else {
        setErr("Invalid credentials");
      }
    } catch (error) {
      console.error("Login error:", error.response || error);
      setErr(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <form className="card form auth-form animate-fade-in" onSubmit={onSubmit}>
        <h2>Welcome Back</h2>
        <p className="auth-subtitle">Sign in to continue your journey</p>

        <label>
          Email Address
          <input
            type="email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            placeholder="Enter your email"
            required
          />
        </label>

        <label>
          Password
          <input
            type="password"
            value={form.password}
            onChange={(e) => update("password", e.target.value)}
            placeholder="Enter your password"
            required
          />
        </label>

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? (
            <span className="loading-spinner">Authenticating...</span>
          ) : (
            "Sign In"
          )}
        </button>

        {err && <p className="form-msg error">{err}</p>}

        <p className="muted">
          New user? <Link to="/signup">Sign up</Link>
        </p>
      </form>
    </div>
  );
}
