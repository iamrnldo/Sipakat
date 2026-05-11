import { NavLink, useNavigate } from "react-router-dom";
import {
  HiHome,
  HiDocumentText,
  HiUsers,
  HiBanknotes,
  HiUser,
  HiArrowRightOnRectangle,
  HiArchiveBox,
} from "react-icons/hi2";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../hooks/useToast";
import { getInitials } from "../../utils/formatters";
import logo from "../../assets/logo2.png";

const navItems = [
  { to: "/dashboard", icon: HiHome, label: "Dashboard" },
  { to: "/arsip", icon: HiDocumentText, label: "Arsip Perencanaan" },
  { to: "/kepegawaian", icon: HiUsers, label: "Kepegawaian" },
  { to: "/keuangan", icon: HiBanknotes, label: "Keuangan Desa" },
  { to: "/profil", icon: HiUser, label: "Profil" },
];

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const { success } = useToast();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    success("Berhasil logout");
    navigate("/login");
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
        fixed top-0 left-0 h-full w-64 z-30 flex flex-col
        bg-gradient-to-b from-blue-900 to-blue-800 text-white
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        lg:relative lg:translate-x-0 lg:z-auto
      `}
      >
        {/* Logo */}
        <div className="px-5 py-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0 overflow-hidden">
              <img
                src={logo}
                alt="SIPAKAT"
                className="h-10 w-10 object-contain"
              />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-wide">
                Desa Keterungan
              </h1>
              <p className="text-xs text-blue-200">Kec Krian Sidoarjo</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? "active" : ""}`
              }
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span className="truncate">{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User & Logout */}
        <div className="px-3 py-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-3 py-2 mb-2 rounded-lg bg-white/10">
            <div className="h-8 w-8 rounded-full bg-blue-400 flex items-center justify-center text-xs font-bold shrink-0">
              {user?.foto ? (
                <img
                  src={`http://localhost:5000${user.foto}`}
                  alt=""
                  className="h-8 w-8 rounded-full object-cover"
                />
              ) : (
                getInitials(user?.nama_lengkap)
              )}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user?.nama_lengkap}
              </p>
              <p className="text-xs text-blue-200 capitalize">
                {user?.hak_akses}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="sidebar-link w-full text-red-300 hover:bg-red-500/20 hover:text-red-200"
          >
            <HiArrowRightOnRectangle className="h-5 w-5" />
            <span>Keluar</span>
          </button>
        </div>
      </aside>
    </>
  );
}
