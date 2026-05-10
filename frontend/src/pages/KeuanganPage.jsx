import { useState, useEffect, useCallback, useRef } from "react";
import {
  HiPlus,
  HiArrowDownTray,
  HiPencilSquare,
  HiTrash,
  HiEye,
  HiShare,
  HiMagnifyingGlass,
  HiXMark,
} from "react-icons/hi2";
import { keuanganApi } from "../api/keuanganApi";
import { useToast } from "../hooks/useToast";
import { useAuth } from "../hooks/useAuth";
import Modal from "../components/common/Modal";
import ConfirmDialog from "../components/common/ConfirmDialog";
import Pagination from "../components/common/Pagination";
import EmptyState from "../components/common/EmptyState";
import LoadingSpinner from "../components/common/LoadingSpinner";
import FileUpload from "../components/common/FileUpload";
import { StatusBadge } from "../components/common/Badge";
import {
  formatDate,
  formatFileSize,
  formatCurrency,
  getFileIcon,
} from "../utils/formatters";
import { JENIS_KEUANGAN, TAHUN_OPTIONS } from "../utils/constants";

// ── Keuangan Form ────────────────────────────────────────────────
function KeuanganForm({ initial, onSubmit, loading }) {
  const [form, setForm] = useState({
    nama_dokumen: "",
    jenis_dokumen: "",
    tahun: "",
    tanggal: "",
    nominal: "",
    deskripsi: "",
    status: "aktif",
    ...initial,
  });
  const [file, setFile] = useState(null);

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => {
      if (v !== undefined && v !== null) fd.append(k, v);
    });
    if (file) fd.append("file", file);
    onSubmit(fd);
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="label">
            Nama Dokumen <span className="text-red-500">*</span>
          </label>
          <input
            className="input-field"
            value={form.nama_dokumen}
            onChange={set("nama_dokumen")}
            required
            placeholder="Contoh: APBDes 2024"
          />
        </div>

        <div>
          <label className="label">
            Jenis Dokumen <span className="text-red-500">*</span>
          </label>
          <select
            className="input-field"
            value={form.jenis_dokumen}
            onChange={set("jenis_dokumen")}
            required
          >
            <option value="">Pilih jenis</option>
            {(JENIS_KEUANGAN || []).map((j) => (
              <option key={j} value={j}>
                {j}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label">
            Tahun <span className="text-red-500">*</span>
          </label>
          <select
            className="input-field"
            value={form.tahun}
            onChange={set("tahun")}
            required
          >
            <option value="">Pilih tahun</option>
            {(TAHUN_OPTIONS || []).map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label">
            Tanggal <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            className="input-field"
            value={form.tanggal?.slice(0, 10) || ""}
            onChange={set("tanggal")}
            required
          />
        </div>

        <div>
          <label className="label">Nominal (Rp)</label>
          <input
            type="number"
            className="input-field"
            value={form.nominal || ""}
            onChange={set("nominal")}
            placeholder="0"
            min="0"
            step="1"
          />
        </div>

        {/* Status hanya saat edit */}
        {initial?.id && (
          <div>
            <label className="label">Status</label>
            <select
              className="input-field"
              value={form.status}
              onChange={set("status")}
            >
              <option value="aktif">Aktif</option>
              <option value="arsip">Diarsipkan</option>
            </select>
          </div>
        )}

        <div className="sm:col-span-2">
          <label className="label">Deskripsi</label>
          <textarea
            className="input-field resize-none"
            rows={3}
            value={form.deskripsi || ""}
            onChange={set("deskripsi")}
            placeholder="Deskripsi singkat (opsional)"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="label">File Dokumen</label>
          <FileUpload
            file={file}
            onChange={setFile}
            accept=".pdf,.doc,.docx,.xls,.xlsx"
            label="Upload PDF, Word, atau Excel (maks. 10MB)"
          />
          {initial?.file_name && !file && (
            <p className="text-xs text-slate-400 mt-1.5 flex items-center gap-1">
              <span>File saat ini:</span>
              <span className="font-medium text-slate-600">
                {initial.file_name}
              </span>
            </p>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading
            ? "Menyimpan..."
            : initial?.id
              ? "Simpan Perubahan"
              : "Tambah Dokumen"}
        </button>
      </div>
    </form>
  );
}

// ── Detail View ──────────────────────────────────────────────────
function KeuanganDetail({ data: d }) {
  const rows = [
    ["Nama Dokumen", d.nama_dokumen],
    ["Jenis", d.jenis_dokumen],
    ["Tahun", d.tahun],
    ["Tanggal", formatDate(d.tanggal)],
    ["Nominal", formatCurrency(d.nominal)],
    ["Status", <StatusBadge status={d.status} />],
    ["Dibuat Oleh", d.nama_pembuat || "-"],
    ["Tanggal Input", formatDate(d.created_at)],
  ];

  return (
    <div className="p-6 space-y-2.5">
      {rows.map(([label, val]) => (
        <div
          key={label}
          className="grid grid-cols-3 gap-2 py-1.5 border-b border-slate-50 items-start"
        >
          <p className="text-xs text-slate-400 font-medium">{label}</p>
          <div className="col-span-2 text-sm text-slate-800">{val}</div>
        </div>
      ))}

      {d.deskripsi && (
        <div className="grid grid-cols-3 gap-2 py-1.5 border-b border-slate-50 items-start">
          <p className="text-xs text-slate-400 font-medium">Deskripsi</p>
          <p className="col-span-2 text-sm text-slate-800 whitespace-pre-wrap">
            {d.deskripsi}
          </p>
        </div>
      )}

      {d.file_name && (
        <div className="flex items-center gap-3 mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
          <span className="text-2xl">{getFileIcon(d.file_type)}</span>
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-700 truncate">
              {d.file_name}
            </p>
            <p className="text-xs text-slate-400">
              {formatFileSize(d.file_size)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────
export default function KeuanganPage() {
  const toast = useToast();
  const toastRef = useRef(toast);
  toastRef.current = toast;

  const { user } = useAuth();
  const canEdit = user?.hak_akses !== "viewer";

  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: "",
    jenis: "",
    tahun: "",
    page: 1,
  });
  const [searchInput, setSearchInput] = useState("");

  const [modal, setModal] = useState({ type: null, data: null });
  const [submitting, setSub] = useState(false);
  const [deleting, setDel] = useState(false);

  // Stable fetch — receives filters as argument to avoid stale closure
  const fetchData = useCallback(async (f) => {
    setLoading(true);
    try {
      const res = await keuanganApi.getAll({
        page: f.page,
        limit: 10,
        search: f.search,
        jenis: f.jenis,
        tahun: f.tahun,
      });
      setData(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) {
      toastRef.current.error(
        err.response?.data?.message || "Gagal memuat data keuangan",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => fetchData(filters), filters.search ? 400 : 0);
    return () => clearTimeout(t);
  }, [filters, fetchData]);

  // Debounced search input
  useEffect(() => {
    const t = setTimeout(() => {
      setFilters((p) => ({ ...p, search: searchInput, page: 1 }));
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const setFilter = (k) => (val) =>
    setFilters((p) => ({ ...p, [k]: val, page: 1 }));

  const clearFilters = () => {
    setSearchInput("");
    setFilters({ search: "", jenis: "", tahun: "", page: 1 });
  };

  const hasActiveFilters = filters.search || filters.jenis || filters.tahun;

  const openModal = (type, d = null) => setModal({ type, data: d });
  const closeModal = () => setModal({ type: null, data: null });

  // ── CRUD handlers ────────────────────────────────────────────
  const handleCreate = async (fd) => {
    setSub(true);
    try {
      await keuanganApi.create(fd);
      toast.success("Dokumen berhasil ditambahkan");
      closeModal();
      fetchData(filters);
    } catch (e) {
      toast.error(e.response?.data?.message || "Gagal menambah dokumen");
    } finally {
      setSub(false);
    }
  };

  const handleUpdate = async (fd) => {
    setSub(true);
    try {
      await keuanganApi.update(modal.data.id, fd);
      toast.success("Dokumen berhasil diperbarui");
      closeModal();
      fetchData(filters);
    } catch (e) {
      toast.error(e.response?.data?.message || "Gagal memperbarui dokumen");
    } finally {
      setSub(false);
    }
  };

  const handleDelete = async () => {
    setDel(true);
    try {
      await keuanganApi.delete(modal.data.id);
      toast.success("Dokumen berhasil dihapus");
      closeModal();
      const newPage =
        data.length === 1 && filters.page > 1 ? filters.page - 1 : filters.page;
      setFilters((p) => ({ ...p, page: newPage }));
    } catch {
      toast.error("Gagal menghapus dokumen");
    } finally {
      setDel(false);
    }
  };

  const handleDownload = async (item) => {
    const tid = toast.loading("Mengunduh file...");
    try {
      const res = await keuanganApi.download(item.id);
      const url = URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = item.file_name || "dokumen";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.dismiss(tid);
      toast.success("File berhasil diunduh");
    } catch {
      toast.dismiss(tid);
      toast.error("Gagal mengunduh file");
    }
  };

  const handleShare = async (item) => {
    try {
      const res = await keuanganApi.share(item.id);
      const url = res.data.data.share_url;
      if (url) {
        await navigator.clipboard.writeText(url);
        toast.success("Link berhasil disalin ke clipboard");
      } else {
        toast.error("File tidak tersedia untuk di-share");
      }
    } catch {
      toast.error("Gagal mendapatkan link share");
    }
  };

  // ── Render ───────────────────────────────────────────────────
  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="page-title">Keuangan Desa</h1>
          <p className="text-sm text-slate-400">Kelola dokumen keuangan desa</p>
        </div>
        {canEdit && (
          <button onClick={() => openModal("create")} className="btn-primary">
            <HiPlus className="h-4 w-4" /> Tambah Dokumen
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="card p-4">
        <div className="flex flex-wrap gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[180px]">
            <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Cari dokumen keuangan..."
              className="input-field pl-9 pr-8"
            />
            {searchInput && (
              <button
                onClick={() => setSearchInput("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <HiXMark className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Jenis filter */}
          <select
            className="input-field w-44"
            value={filters.jenis}
            onChange={(e) => setFilter("jenis")(e.target.value)}
          >
            <option value="">Semua Jenis</option>
            {(JENIS_KEUANGAN || []).map((j) => (
              <option key={j} value={j}>
                {j}
              </option>
            ))}
          </select>

          {/* Tahun filter */}
          <select
            className="input-field w-36"
            value={filters.tahun}
            onChange={(e) => setFilter("tahun")(e.target.value)}
          >
            <option value="">Semua Tahun</option>
            {(TAHUN_OPTIONS || []).map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          {/* Reset filters */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="btn-secondary text-sm gap-1.5"
            >
              <HiXMark className="h-4 w-4" /> Reset
            </button>
          )}
        </div>
      </div>

      {/* Table Card */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        ) : data.length === 0 ? (
          <EmptyState
            icon="💰"
            title={
              hasActiveFilters
                ? "Tidak ada dokumen yang cocok"
                : "Belum ada dokumen keuangan"
            }
            description={
              hasActiveFilters
                ? "Coba ubah filter pencarian"
                : "Tambahkan dokumen keuangan desa"
            }
            action={
              !hasActiveFilters && canEdit ? (
                <button
                  onClick={() => openModal("create")}
                  className="btn-primary mt-2"
                >
                  <HiPlus className="h-4 w-4" /> Tambah Dokumen
                </button>
              ) : hasActiveFilters ? (
                <button onClick={clearFilters} className="btn-secondary mt-2">
                  Reset Filter
                </button>
              ) : null
            }
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Nama Dokumen
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">
                      Jenis
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden sm:table-cell">
                      Tahun
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden lg:table-cell">
                      Nominal
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Status
                    </th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.map((item) => (
                    <tr key={item.id} className="table-row-hover">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <span className="text-xl shrink-0">
                            {getFileIcon(item.file_type)}
                          </span>
                          <div className="min-w-0">
                            <p
                              className="font-medium text-slate-800 max-w-xs truncate"
                              title={item.nama_dokumen}
                            >
                              {item.nama_dokumen}
                            </p>
                            <p className="text-xs text-slate-400">
                              {formatDate(item.tanggal)}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-600 hidden md:table-cell">
                        {item.jenis_dokumen}
                      </td>
                      <td className="px-4 py-3 text-slate-600 hidden sm:table-cell">
                        {item.tahun}
                      </td>
                      <td className="px-4 py-3 text-slate-700 font-medium hidden lg:table-cell">
                        {formatCurrency(item.nominal)}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={item.status} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            title="Lihat Detail"
                            onClick={() => openModal("view", item)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <HiEye className="h-4 w-4" />
                          </button>
                          {item.file_path && (
                            <>
                              <button
                                title="Download File"
                                onClick={() => handleDownload(item)}
                                className="p-1.5 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              >
                                <HiArrowDownTray className="h-4 w-4" />
                              </button>
                              <button
                                title="Salin Link"
                                onClick={() => handleShare(item)}
                                className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                              >
                                <HiShare className="h-4 w-4" />
                              </button>
                            </>
                          )}
                          {canEdit && (
                            <>
                              <button
                                title="Edit Dokumen"
                                onClick={() => openModal("edit", item)}
                                className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                              >
                                <HiPencilSquare className="h-4 w-4" />
                              </button>
                              <button
                                title="Hapus Dokumen"
                                onClick={() => openModal("delete", item)}
                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <HiTrash className="h-4 w-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination
              pagination={pagination}
              onPageChange={(p) => setFilters((prev) => ({ ...prev, page: p }))}
            />
          </>
        )}
      </div>

      {/* ── Modals ──────────────────────────────────────────────── */}
      <Modal
        isOpen={modal.type === "create"}
        onClose={closeModal}
        title="Tambah Dokumen Keuangan"
        size="lg"
      >
        <KeuanganForm onSubmit={handleCreate} loading={submitting} />
      </Modal>

      <Modal
        isOpen={modal.type === "edit"}
        onClose={closeModal}
        title="Edit Dokumen Keuangan"
        size="lg"
      >
        {modal.data && (
          <KeuanganForm
            initial={modal.data}
            onSubmit={handleUpdate}
            loading={submitting}
          />
        )}
      </Modal>

      <Modal
        isOpen={modal.type === "view"}
        onClose={closeModal}
        title="Detail Dokumen Keuangan"
        size="md"
      >
        {modal.data && <KeuanganDetail data={modal.data} />}
      </Modal>

      <ConfirmDialog
        isOpen={modal.type === "delete"}
        onClose={closeModal}
        onConfirm={handleDelete}
        loading={deleting}
        title="Hapus Dokumen?"
        message={`Dokumen "${modal.data?.nama_dokumen}" akan dihapus. Tindakan ini tidak dapat dibatalkan.`}
      />
    </div>
  );
}
