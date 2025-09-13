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
import Profile from "./pages/Profile";
import MyDonations from "./pages/MyDonations";
import MyTransactions from "./pages/MyTransactions";
import DonationSuccess from "./pages/DonationSuccess";
import MyWallet from "./pages/MyWallet";

export default function App() {
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
                <Route path="/profile" element={<Profile />} />
                <Route path="/my-donations" element={<MyDonations />} />
                <Route path="/my-transactions" element={<MyTransactions />} />
                <Route path="/my-wallet" element={<MyWallet />} />
                
              <Route path="/campaigns/:id" element={<CampaignDetail />} />
              <Route path="/donation-success" element={<DonationSuccess />} />
                            <Route path="/campaigns" element={<CampaignList />} />

              </Route>

              {/* NGO routes */}
              <Route element={<ProtectedRoute roles={[2]} />}>
                <Route path="/ngo" element={<NgoDashboard />} />
                <Route path="/create-campaign" element={<CreateCampaign />} />
                
              <Route path="/campaigns" element={<CampaignList />} />
              <Route path="/campaigns/:id" element={<CampaignDetail />} />
              </Route>

              {/* Admin routes */}
              <Route element={<ProtectedRoute roles={[1]} />}>
                <Route path="/admin" element={<AdminDashboard />} />
              </Route>

              {/* 404 Page */}
              <Route
                path="*"
                element={
                  <div className="container" style={{ padding: "4rem 0", textAlign: "center" }}>
                    <h2 style={{ color: "var(--text-muted)" }}>404 - Page Not Found</h2>
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
      </WalletProvider>
    </AuthProvider>
  );
}
