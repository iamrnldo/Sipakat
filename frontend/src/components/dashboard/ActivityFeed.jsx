import { formatDateTime } from "../../utils/formatters";

const modulColors = {
  AUTH: "bg-slate-100 text-slate-600",
  ARSIP: "bg-blue-100 text-blue-700",
  KEPEGAWAIAN: "bg-green-100 text-green-700",
  KEUANGAN: "bg-amber-100 text-amber-700",
  PROFIL: "bg-purple-100 text-purple-700",
};

export default function ActivityFeed({ activities = [] }) {
  if (!activities.length) {
    return (
      <p className="text-sm text-slate-400 text-center py-8">
        Belum ada aktivitas
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {activities.map((a, i) => (
        <div key={i} className="flex items-start gap-3">
          <div
            className={`shrink-0 px-2 py-0.5 rounded-md text-xs font-medium ${modulColors[a.modul] || modulColors.AUTH}`}
          >
            {a.modul}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-slate-700 leading-snug">{a.deskripsi}</p>
            <p className="text-xs text-slate-400 mt-0.5">
              {formatDateTime(a.created_at)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
