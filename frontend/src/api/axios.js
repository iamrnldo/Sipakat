import axios from "axios";
import toast from "react-hot-toast";

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  timeout: 30000,
  headers: { "Content-Type": "application/json" },
});

instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("sipakat_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error),
);

instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("sipakat_token");
      localStorage.removeItem("sipakat_user");
      toast.error("Sesi habis. Silakan login kembali");
      window.location.href = "/login";
    } else if (error.response?.status === 403) {
      toast.error("Akses ditolak");
    } else if (error.response?.status === 500) {
      toast.error("Terjadi kesalahan server");
    }
    return Promise.reject(error);
  },
);

export default instance;
