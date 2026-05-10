export default function EmptyState({ icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="text-5xl mb-4">{icon || "📂"}</div>
      <h3 className="text-base font-semibold text-slate-700 mb-1">
        {title || "Tidak ada data"}
      </h3>
      {description && (
        <p className="text-sm text-slate-400 mb-4">{description}</p>
      )}
      {action}
    </div>
  );
}
