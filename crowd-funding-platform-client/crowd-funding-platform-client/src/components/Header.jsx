import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";

export default function Header() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    nav("/login");
  };

  const isActive = (path) => {
    return location.pathname === path ? "active" : "";
  };

  return (
    <header className={`site-header ${scrolled ? 'scrolled' : ''}`}>
      <div className="container header-inner">
        <Link to="/" className="brand animate-fade-in">Crowd<span>Fund</span></Link>

        <nav className="nav stagger-animation">
          {!user && (
            <>
              <Link to="/login" className={`btn btn-sm ${isActive("/login")}`}>Login</Link>
              <Link to="/signup" className={`btn btn-sm btn-outline ${isActive("/signup")}`}>Sign Up</Link>
            </>
          )}

          {user && user.role === 3 && (
            <>
              <Link to="/donor" className={isActive("/donor")}>Dashboard</Link>
              <Link to="/campaigns" className={isActive("/campaigns")}>Campaigns</Link>
              <Link to="/my-donations" className={isActive("/my-donations")}>My Donations</Link>
              <Link to="/my-wallet" className={isActive("/my-wallet")}>My Wallet</Link>
              <Link to="/profile" className={isActive("/profile")}>My Profile</Link>
              <button className="btn btn-sm hover-lift" onClick={handleLogout}>Logout</button>
            </>
          )}

          {user && user.role === 2  && ( 
            <>
              <Link to="/campaigns" className={isActive("/campaigns")}>Campaigns</Link>
              <Link to="/ngo" className={isActive("/ngo")}>My Campaigns</Link>
              <Link to="/create-campaign" className={`btn btn-sm hover-glow ${isActive("/create-campaign")}`}>Create</Link>
              <button className="btn btn-sm btn-outline hover-lift" onClick={handleLogout}>Logout</button>
            </>
          )}

          {user && user.role === 1  && (
            <>
              <Link to="/admin" className={isActive("/admin")}>Admin</Link>
              <Link to="/campaigns" className={isActive("/campaigns")}>Campaigns</Link>
              <button className="btn btn-sm hover-lift" onClick={handleLogout}>Logout</button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
