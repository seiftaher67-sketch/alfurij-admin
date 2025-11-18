import axios from "axios";

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || "/api",
  timeout: 20000,
});

client.interceptors.request.use((cfg) => {
  const token = localStorage.getItem("token");
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

export default client;
