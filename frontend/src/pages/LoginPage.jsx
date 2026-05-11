import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { HiEye, HiEyeSlash, HiLockClosed, HiUser } from "react-icons/hi2";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";
import LoadingSpinner from "../components/common/LoadingSpinner";
import logo from "../assets/logo3.png";
import bgImage from "../assets/background.jpeg";

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
      toast.error("Username/email dan password wajib diisi");
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
    <div
      className="min-h-screen flex items-center justify-center p-4 relative"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Dark overlay agar card tetap terbaca */}
      <div className="absolute inset-0 bg-blue-900/60" />

      <div className="relative z-10 w-full max-w-md animate-fade-in">
        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-10 text-center">
            <div className="flex items-center justify-center">
              <img
                src={logo}
                alt="SIPAKAT"
                className="h-26 w-auto object-contain "
              />
            </div>
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
              {/* Username or Email */}
              <div>
                <label className="label">Username atau Email</label>
                <div className="relative">
                  <HiUser className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Username atau email"
                    value={form.username}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, username: e.target.value }))
                    }
                    className="input-field pl-10"
                    autoComplete="username"
                    autoCapitalize="none"
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
                Sipakat:{" "}
                <span className="font-semibold text-slate-600">lebih terlindungi</span> /{" "}
                <span className="font-semibold text-slate-600">lebih nyaman</span>
              </p>
            </div>
          </div>
        </div>

        <p className="text-center text-white/50 text-xs mt-6">
          © 2024 SIPAKAT — Sistem Pengarsipan Desa v1.0
        </p>
      </div>
    </div>
  );
}
