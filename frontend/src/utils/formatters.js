import { format, parseISO, isValid } from "date-fns";
import { id } from "date-fns/locale";

export const formatDate = (dateStr, fmt = "dd MMM yyyy") => {
  if (!dateStr) return "-";
  try {
    const d = typeof dateStr === "string" ? parseISO(dateStr) : dateStr;
    return isValid(d) ? format(d, fmt, { locale: id }) : "-";
  } catch {
    return "-";
  }
};

export const formatDateTime = (dateStr) =>
  formatDate(dateStr, "dd MMM yyyy, HH:mm");

export const formatCurrency = (amount) => {
  if (amount == null) return "-";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};

export const formatFileSize = (bytes) => {
  if (!bytes) return "-";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
};

export const getFileIcon = (fileType) => {
  if (!fileType) return "📄";
  if (fileType.includes("pdf")) return "📕";
  if (fileType.includes("word")) return "📘";
  if (fileType.includes("sheet") || fileType.includes("excel")) return "📗";
  if (fileType.includes("image")) return "🖼️";
  return "📄";
};

export const getInitials = (name = "") =>
  name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

export const truncate = (str, n = 40) =>
  str?.length > n ? str.slice(0, n) + "…" : str;
