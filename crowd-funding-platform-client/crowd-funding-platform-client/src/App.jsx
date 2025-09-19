import { useState } from "react";
import { Routes, Route } from "react-router-dom";

import Header from "./components/Header";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import { WalletProvider } from "./context/WalletContext";
import { AuthProvider } from "./context/AuthContext";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import CampaignList from "./pages/CampaignList";
import CampaignDetail from "./pages/CampaignDetail";
import CreateCampaign from "./pages/CreateCampaign";
import DonorDashboard from "./pages/DonorDashboard";
import NgoDashboard from "./pages/NgoDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import HeroSection from "./pages/HeroSection";

import MyDonations from "./pages/MyDonations";
import MyTransactions from "./pages/MyTransactions";
import DonationSuccess from "./pages/DonationSuccess";
import MyWallet from "./pages/MyWallet";
import MyCampaigns from "./pages/MyCampaigns";
import Profile from "./pages/Profile";
import ProfilePage from "./pages/ProfilePage";
import VerifyNgo from "./pages/VerifyNgo";
import DonorCampaignList from "./pages/DonorCampaignList";
import DonationForm from "./pages/DonationForm";

// Import chatbot
import ChatWidget from "./pages/ChatWidget";
import "./App.css";  // merged styles or additional ones for chatbot

export default function App() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <AuthProvider>
      <WalletProvider>
        <div className="app">
          <Header />
          <main className="main" style={{ marginTop: "70px" }}>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<HeroSection />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />

              {/* Donor routes */}
              <Route element={<ProtectedRoute roles={[3]} />}>
                <Route path="/donor" element={<DonorDashboard />} />
                <Route path="/my-donations" element={<MyDonations />} />
                <Route path="/my-transactions" element={<MyTransactions />} />
                <Route path="/my-wallet" element={<MyWallet />} />
                <Route path="/campaigns/:id" element={<CampaignDetail />} />
                <Route path="/donation-success" element={<DonationSuccess />} />
                <Route path="/d-campaigns" element={<DonorCampaignList />} />
                <Route path="/donate/:id" element={<DonationForm />} />
              </Route>

              {/* NGO routes */}
              <Route element={<ProtectedRoute roles={[2]} />}>
                <Route path="/ngo" element={<NgoDashboard />} />
                <Route path="/create-campaign" element={<CreateCampaign />} />
                <Route path="/my-campaigns" element={<MyCampaigns />} />
                {/* <Route path="/campaigns" element={<CampaignList />} />  */}
                <Route path="/campaigns/:id" element={<CampaignDetail />} />
                <Route path="/VerifyNgo" element={<VerifyNgo />} />
              </Route>

              {/* Admin routes */}
              <Route element={<ProtectedRoute roles={[1]} />}>
                <Route path="/admin" element={<AdminDashboard />} />
              </Route>
              <Route element={<ProtectedRoute roles={[1, 2]} />}>
                <Route path="/my-profile" element={<ProfilePage />} />
                <Route path="/campaigns" element={<CampaignList />} />
              </Route>

              {/* 404 Page */}
              <Route
                path="*"
                element={
                  <div
                    className="container"
                    style={{ padding: "4rem 0", textAlign: "center" }}
                  >
                    <h2 style={{ color: "var(--text-muted)" }}>404 - Page Not Found</h2>
                    <p style={{ color: "var(--text-muted)", marginTop: "1rem" }}>
                      The page you're looking for doesn't exist.
                    </p>
                  </div>
                }
              />
            </Routes>

            {/* Chat Widget Button */}
            <div className="chat-container">
              {!isOpen && (
                <button className="chat-toggle-btn" onClick={() => setIsOpen(true)}>
                  💬
                </button>
              )}
              <div className={`chat-widget-container ${isOpen ? "open" : "closed"}`}>
                {isOpen && (
                  <div className="chat-widget-wrapper">
                    <ChatWidget />
                    <button className="close-btn" onClick={() => setIsOpen(false)}>
                      ✖
                    </button>
                  </div>
                )}
              </div>
            </div>
          </main>
          <Footer />
        </div>
      </WalletProvider>
    </AuthProvider>
  );
}
