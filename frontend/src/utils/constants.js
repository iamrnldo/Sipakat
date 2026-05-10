export const JENIS_ARSIP = [
  "RPJMDes",
  "RKPDes",
  "APBDes",
  "Peraturan Desa",
  "Surat Keputusan",
  "Laporan Tahunan",
  "Renstra",
  "Lainnya",
];

export const JENIS_KEUANGAN = [
  "APBDes",
  "RAB",
  "SPJ",
  "Laporan Keuangan",
  "LKPD",
  "Nota Dinas",
  "Kwitansi",
  "Laporan Realisasi",
  "Lainnya",
];

export const TAHUN_OPTIONS = Array.from({ length: 10 }, (_, i) =>
  String(new Date().getFullYear() - i),
);

export const STATUS_APARATUR = [
  { value: "aktif", label: "Aktif" },
  { value: "nonaktif", label: "Nonaktif" },
  { value: "pensiun", label: "Pensiun" },
];

export const HAK_AKSES = [
  { value: "admin", label: "Admin" },
  { value: "user", label: "User" },
  { value: "viewer", label: "Viewer" },
];

export const GOLONGAN = [
  "I/a",
  "I/b",
  "I/c",
  "I/d",
  "II/a",
  "II/b",
  "II/c",
  "II/d",
  "III/a",
  "III/b",
  "III/c",
  "III/d",
  "IV/a",
  "IV/b",
  "IV/c",
  "IV/d",
  "IV/e",
];
