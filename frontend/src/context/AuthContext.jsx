import { createContext, useState, useEffect, useCallback } from "react";
import { authApi } from "../api/authApi";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ FIX 4: Tidak langsung set user dari localStorage — verifikasi ke server dulu
  // Mencegah race condition dan penggunaan data user yang sudah stale
  useEffect(() => {
    const token = localStorage.getItem("sipakat_token");

    if (!token) {
      setLoading(false);
      return;
    }

    authApi
      .getMe()
      .then((r) => setUser(r.data.data))
      .catch(() => {
        localStorage.removeItem("sipakat_token");
        localStorage.removeItem("sipakat_user");
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (username, password) => {
    const res = await authApi.login({ username, password });
    const { token, user: userData } = res.data.data;
    localStorage.setItem("sipakat_token", token);
    localStorage.setItem("sipakat_user", JSON.stringify(userData));
    setUser(userData);
    return userData;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch (_) {
      // Tetap lanjutkan logout meskipun request gagal
    }
    localStorage.removeItem("sipakat_token");
    localStorage.removeItem("sipakat_user");
    setUser(null);
  }, []);

  const updateUser = useCallback((data) => {
    setUser((prev) => {
      const updated = { ...prev, ...data };
      localStorage.setItem("sipakat_user", JSON.stringify(updated));
      return updated;
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}
