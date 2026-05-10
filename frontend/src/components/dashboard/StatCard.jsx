export default function StatCard({ title, value, icon: Icon, color, trend }) {
  const colors = {
    blue: {
      bg: "bg-blue-50",
      icon: "bg-blue-100 text-blue-600",
      text: "text-blue-600",
    },
    green: {
      bg: "bg-green-50",
      icon: "bg-green-100 text-green-600",
      text: "text-green-600",
    },
    yellow: {
      bg: "bg-amber-50",
      icon: "bg-amber-100 text-amber-600",
      text: "text-amber-600",
    },
    purple: {
      bg: "bg-purple-50",
      icon: "bg-purple-100 text-purple-600",
      text: "text-purple-600",
    },
  };
  const c = colors[color] || colors.blue;

  return (
    <div className={`card p-5 ${c.bg} border-0`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500 font-medium mb-1">{title}</p>
          <p className="text-3xl font-bold text-slate-800">{value ?? 0}</p>
          {trend && <p className="text-xs text-slate-400 mt-1">{trend}</p>}
        </div>
        <div
          className={`h-12 w-12 rounded-xl flex items-center justify-center ${c.icon}`}
        >
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}
