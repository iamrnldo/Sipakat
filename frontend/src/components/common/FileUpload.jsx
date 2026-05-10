import { useRef } from "react";
import { HiArrowUpTray, HiDocument, HiXMark } from "react-icons/hi2";
import { formatFileSize } from "../../utils/formatters";

export default function FileUpload({
  file,
  onChange,
  accept,
  label = "Upload File",
}) {
  const ref = useRef();

  return (
    <div>
      {!file ? (
        <label
          className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed
                     border-slate-300 rounded-xl cursor-pointer hover:border-blue-400
                     hover:bg-blue-50 transition-colors"
          onClick={() => ref.current?.click()}
        >
          <HiArrowUpTray className="h-6 w-6 text-slate-400 mb-2" />
          <span className="text-sm text-slate-500">{label}</span>
          <span className="text-xs text-slate-400 mt-0.5">
            Klik untuk memilih file
          </span>
          <input
            ref={ref}
            type="file"
            accept={accept}
            className="hidden"
            onChange={(e) => onChange(e.target.files[0])}
          />
        </label>
      ) : (
        <div className="flex items-center gap-3 p-3 border border-slate-200 rounded-xl bg-slate-50">
          <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
            <HiDocument className="h-5 w-5 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-700 truncate">
              {file.name}
            </p>
            <p className="text-xs text-slate-400">
              {formatFileSize(file.size)}
            </p>
          </div>
          <button
            onClick={() => onChange(null)}
            className="p-1 hover:text-red-500 text-slate-400"
          >
            <HiXMark className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
