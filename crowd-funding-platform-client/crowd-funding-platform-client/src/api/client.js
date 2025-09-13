import axios from "axios";

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://crowd-funding-platform-server.vercel.app",
  withCredentials: false,
  headers: { "Content-Type": "application/json" },
});

// Add authorization token to requests if available
client.interceptors.request.use(config => {
  const token = localStorage.getItem('authToken');
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

export default client;
