import axios from "axios";

const api = axios.create({
  baseURL: "https://homework-backend-ks8j.onrender.com",
  headers: { "Content-Type": "application/json" },
  timeout: 30000,
});

export default api;
