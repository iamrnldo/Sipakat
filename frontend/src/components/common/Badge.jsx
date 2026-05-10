const variants = {
  success: "bg-green-100 text-green-700 border-green-200",
  danger: "bg-red-100  text-red-700  border-red-200",
  warning: "bg-yellow-100 text-yellow-700 border-yellow-200",
  info: "bg-blue-100  text-blue-700  border-blue-200",
  gray: "bg-slate-100 text-slate-600 border-slate-200",
};

export default function Badge({ children, variant = "gray" }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${variants[variant]}`}
    >
      {children}
    </span>
  );
}

export function StatusBadge({ status }) {
  const map = {
    aktif: { variant: "success", label: "Aktif" },
    nonaktif: { variant: "danger", label: "Nonaktif" },
    pensiun: { variant: "gray", label: "Pensiun" },
    arsip: { variant: "warning", label: "Diarsipkan" },
    hapus: { variant: "danger", label: "Dihapus" },
  };
  const { variant, label } = map[status] || { variant: "gray", label: status };
  return <Badge variant={variant}>{label}</Badge>;
}

export function HakAksesBadge({ hak }) {
  const map = {
    admin: { variant: "danger", label: "Admin" },
    user: { variant: "info", label: "User" },
    viewer: { variant: "gray", label: "Viewer" },
  };
  const { variant, label } = map[hak] || { variant: "gray", label: hak };
  return <Badge variant={variant}>{label}</Badge>;
}
