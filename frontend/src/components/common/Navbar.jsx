import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  HiBars3,
  HiBell,
  HiChevronDown,
  HiUser,
  HiArrowRightOnRectangle,
} from "react-icons/hi2";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../hooks/useToast";
import { getInitials } from "../../utils/formatters";
import logo from "../../assets/logo.png";

export default function Navbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const { success } = useToast();
  const navigate = useNavigate();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setDropdownOpen(false);
    await logout();
    success("Berhasil logout");
    navigate("/login");
  };

  const handleNavigate = (path) => {
    setDropdownOpen(false);
    navigate(path);
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 shrink-0">
      {/* Left: Hamburger + Logo */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 lg:hidden"
        >
          <HiBars3 className="h-5 w-5" />
        </button>

        <div className="hidden sm:block">
          <img src={logo} alt="SIPAKAT" className="h-16 w-auto object-contain" />
        </div>
      </div>

      {/* Right: Bell + Profile dropdown */}
      <div className="flex items-center gap-2">
        {/* Notification Bell */}
        <button className="relative p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors">
          <HiBell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full" />
        </button>

        {/* Profile Dropdown */}
        <div
          ref={dropdownRef}
          className="relative pl-3 border-l border-slate-200"
        >
          {/* Trigger button */}
          <button
            onClick={() => setDropdownOpen((p) => !p)}
            className="flex items-center gap-2 p-1 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white overflow-hidden shrink-0">
              {user?.foto ? (
                <img
                  src={`http://localhost:5000${user.foto}`}
                  alt=""
                  className="h-8 w-8 object-cover"
                />
              ) : (
                getInitials(user?.nama_lengkap)
              )}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-semibold text-slate-800 leading-none truncate max-w-[120px]">
                {user?.nama_lengkap}
              </p>
              <p className="text-xs text-slate-400 capitalize mt-0.5">
                {user?.hak_akses}
              </p>
            </div>
            <HiChevronDown
              className={`h-4 w-4 text-slate-400 hidden sm:block transition-transform duration-200 ${
                dropdownOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Dropdown panel */}
          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-50 animate-fade-in">
              {/* User info */}
              <div className="px-4 py-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-sm font-bold text-white overflow-hidden shrink-0">
                    {user?.foto ? (
                      <img
                        src={`http://localhost:5000${user.foto}`}
                        alt=""
                        className="h-10 w-10 object-cover"
                      />
                    ) : (
                      getInitials(user?.nama_lengkap)
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">
                      {user?.nama_lengkap}
                    </p>
                    <p className="text-xs text-slate-400 truncate">
                      {user?.email}
                    </p>
                  </div>
                </div>
              </div>

              {/* Profil link */}
              <div className="py-1">
                <button
                  onClick={() => handleNavigate("/profil")}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <HiUser className="h-4 w-4 text-slate-400 shrink-0" />
                  <span>Profil Saya</span>
                </button>
              </div>

              {/* Logout */}
              <div className="border-t border-slate-100 py-1">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <HiArrowRightOnRectangle className="h-4 w-4 shrink-0" />
                  <span>Keluar</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
