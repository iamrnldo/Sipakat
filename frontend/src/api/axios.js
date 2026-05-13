import axios from "axios";

const api = axios.create({
  baseURL: "/api", // Vite proxy akan forward ke localhost:5000
});

// ✅ FIX 3: Interceptor request — selalu sertakan token JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("sipakat_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ✅ FIX 3: Interceptor response — handle token expired / invalid
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired atau tidak valid → bersihkan storage & redirect login
      localStorage.removeItem("sipakat_token");
      localStorage.removeItem("sipakat_user");
      // Hindari redirect loop jika sudah di halaman login
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

export default api;
