import { HiChevronLeft, HiChevronRight } from "react-icons/hi2";

export default function Pagination({ pagination, onPageChange }) {
  if (!pagination || pagination.total_pages <= 1) return null;

  const { page, total_pages, total, limit } = pagination;
  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  const pages = [];
  for (let i = 1; i <= total_pages; i++) {
    if (i === 1 || i === total_pages || (i >= page - 1 && i <= page + 1))
      pages.push(i);
    else if (pages[pages.length - 1] !== "...") pages.push("...");
  }

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200">
      <p className="text-sm text-slate-500">
        Menampilkan{" "}
        <span className="font-medium">
          {start}–{end}
        </span>{" "}
        dari <span className="font-medium">{total}</span> data
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <HiChevronLeft className="h-4 w-4" />
        </button>
        {pages.map((p, i) =>
          p === "..." ? (
            <span key={i} className="px-2 text-slate-400 text-sm">
              …
            </span>
          ) : (
            <button
              key={i}
              onClick={() => onPageChange(p)}
              className={`w-8 h-8 text-sm rounded-lg font-medium transition-colors ${
                p === page
                  ? "bg-blue-600 text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {p}
            </button>
          ),
        )}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === total_pages}
          className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <HiChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
