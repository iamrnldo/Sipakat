import { HiMagnifyingGlass } from "react-icons/hi2";

export default function SearchBar({
  value,
  onChange,
  placeholder = "Cari...",
  className = "",
}) {
  return (
    <div className={`relative ${className}`}>
      <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="input-field pl-9"
      />
    </div>
  );
}
