import { Routes, Route, Navigate } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import CampaignList from "./pages/CampaignList";
import CampaignDetail from "./pages/CampaignDetail";
import CreateCampaign from "./pages/CreateCampaign";
import DonorDashboard from "./pages/DonorDashboard";
import NgoDashboard from "./pages/NgoDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import HeroSection from "./pages/HeroSection"; 

export default function App() {
  return (
    <div className="app">
      <Header />
      <main className="main" style={{ marginTop: "70px" }}>
        <Routes>
          {/* Homepage with HeroSection */}
          <Route path="/" element={<HeroSection />} />

          {/* Auth routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Campaign routes */}
          <Route path="/campaigns" element={<CampaignList />} />
          <Route path="/campaigns/:id" element={<CampaignDetail />} />


          <Route element={<ProtectedRoute roles={["DONOR"]} />}>
            <Route path="/donor" element={<DonorDashboard />} />
          </Route>

          <Route element={<ProtectedRoute roles={["NGO"]} />}>
            <Route path="/ngo" element={<NgoDashboard />} />
            <Route path="/create-campaign" element={<CreateCampaign />} />
          </Route>

          {/* Admin route - temporarily accessible without authentication */}
          <Route path="/admin" element={<AdminDashboard />} />

          {/* 404 Page */}
          <Route
            path="*"
            element={
              <div
                className="container"
                style={{ padding: "4rem 0", textAlign: "center" }}
              >
                <h2 style={{ color: "var(--text-muted)" }}>
                  404 - Page Not Found
                </h2>
                <p style={{ color: "var(--text-muted)", marginTop: "1rem" }}>
                  The page you're looking for doesn't exist.
                </p>
              </div>
            }
          />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
