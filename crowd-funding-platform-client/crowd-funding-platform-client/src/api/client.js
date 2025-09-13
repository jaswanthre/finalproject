import axios from "axios";

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
  withCredentials: false,
  headers: { "Content-Type": "application/json" },
});

// Create separate clients for different services if needed
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

client.interceptors.response.use(
  (res) => res,
  (err) => {
    const msg = err?.response?.data?.message || err.message || "Network error";
    return Promise.reject(new Error(msg));
  }
);

export default client;
