import axios from "axios";

// Base client
const client = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    "https://crowd-funding-platform-server.vercel.app",
  withCredentials: false,
  headers: { "Content-Type": "application/json" },
});

// Add interceptors to the base client
client.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

client.interceptors.response.use(
  (res) => res,
  (err) => {
    const msg = err?.response?.data?.message || err.message || "Network error";
    return Promise.reject(new Error(msg));
  }
);

// Separate clients for different services
export const donorServiceClient = axios.create({
  baseURL: import.meta.env.VITE_DONOR_SERVICE_URL || "http://localhost:3001",
  withCredentials: false,
  headers: { "Content-Type": "application/json" },
});

export const campaignServiceClient = axios.create({
  baseURL: import.meta.env.VITE_CAMPAIGN_SERVICE_URL || "http://localhost:3002",
  withCredentials: false,
  headers: { "Content-Type": "application/json" },
});

export default client;
