import { createContext, useState, useEffect, useCallback } from "react";
import { authApi } from "../api/authApi";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    const token = localStorage.getItem("sipakat_token");
    const saved = localStorage.getItem("sipakat_user");
    if (token && saved) {
      setUser(JSON.parse(saved));
      // Verify token still valid
      authApi
        .getMe()
        .then((r) => setUser(r.data.data))
        .catch(() => {
          localStorage.removeItem("sipakat_token");
          localStorage.removeItem("sipakat_user");
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
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
    } catch (_) {}
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
