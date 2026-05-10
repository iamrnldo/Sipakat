import { HiBars3, HiBell, HiChevronDown } from "react-icons/hi2";
import { useAuth } from "../../hooks/useAuth";
import { getInitials } from "../../utils/formatters";

export default function Navbar({ onMenuClick }) {
  const { user } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 shrink-0">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 lg:hidden"
        >
          <HiBars3 className="h-5 w-5" />
        </button>
        <div className="hidden sm:block">
          <p className="text-sm text-slate-500">Selamat datang,</p>
          <p className="text-sm font-semibold text-slate-800 leading-none">
            {user?.nama_lengkap}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button className="relative p-2 rounded-lg text-slate-500 hover:bg-slate-100">
          <HiBell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full" />
        </button>

        <div className="flex items-center gap-2 pl-3 border-l border-slate-200">
          <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white overflow-hidden">
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
          <HiChevronDown className="h-4 w-4 text-slate-400 hidden sm:block" />
        </div>
      </div>
    </header>
  );
}
