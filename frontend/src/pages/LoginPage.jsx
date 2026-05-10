import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  HiEye,
  HiEyeSlash,
  HiArchiveBox,
  HiLockClosed,
  HiUser,
} from "react-icons/hi2";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";
import LoadingSpinner from "../components/common/LoadingSpinner";

export default function LoginPage() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username || !form.password) {
      toast.error("Username dan password wajib diisi");
      return;
    }
    setLoading(true);
    try {
      await login(form.username, form.password);
      toast.success("Login berhasil! Selamat datang");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login gagal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center p-4">
      {/* Background blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full translate-x-1/2 translate-y-1/2" />

      <div className="relative w-full max-w-md animate-fade-in">
        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-10 text-center">
            <div className="inline-flex items-center justify-center h-16 w-16 bg-white/20 rounded-2xl mb-4">
              <HiArchiveBox className="h-9 w-9 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white tracking-wide">
              SIPAKAT
            </h1>
            <p className="text-blue-200 text-sm mt-1">
              Sistem Pengarsipan Desa
            </p>
          </div>

          {/* Form */}
          <div className="px-8 py-8">
            <h2 className="text-xl font-bold text-slate-800 mb-1">
              Masuk ke Akun
            </h2>
            <p className="text-slate-400 text-sm mb-6">
              Silakan masukkan kredensial Anda
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username */}
              <div>
                <label className="label">Username</label>
                <div className="relative">
                  <HiUser className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Masukkan username"
                    value={form.username}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, username: e.target.value }))
                    }
                    className="input-field pl-10"
                    autoComplete="username"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="label">Password</label>
                <div className="relative">
                  <HiLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type={showPw ? "text" : "password"}
                    placeholder="Masukkan password"
                    value={form.password}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, password: e.target.value }))
                    }
                    className="input-field pl-10 pr-10"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPw ? (
                      <HiEyeSlash className="h-4 w-4" />
                    ) : (
                      <HiEye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold
                           rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-150
                           disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-blue-500/30 mt-2"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <LoadingSpinner size="sm" color="white" /> Memproses...
                  </span>
                ) : (
                  "Masuk"
                )}
              </button>
            </form>

            <div className="mt-6 p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
              <p className="text-xs text-slate-400">
                Default:{" "}
                <span className="font-semibold text-slate-600">admin</span> /{" "}
                <span className="font-semibold text-slate-600">admin123</span>
              </p>
            </div>
          </div>
        </div>

        <p className="text-center text-blue-200/60 text-xs mt-6">
          © 2024 SIPAKAT — Sistem Pengarsipan Desa v1.0
        </p>
      </div>
    </div>
  );
}
