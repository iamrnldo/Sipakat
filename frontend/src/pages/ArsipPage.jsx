import { useState, useEffect, useCallback } from "react";
import {
  HiPlus,
  HiArrowDownTray,
  HiPencilSquare,
  HiTrash,
  HiEye,
  HiFunnel,
  HiDocumentText,
} from "react-icons/hi2";
import { arsipApi } from "../api/arsipApi";
import { useToast } from "../hooks/useToast";
import { useAuth } from "../hooks/useAuth";
import Modal from "../components/common/Modal";
import ConfirmDialog from "../components/common/ConfirmDialog";
import Pagination from "../components/common/Pagination";
import SearchBar from "../components/common/SearchBar";
import EmptyState from "../components/common/EmptyState";
import LoadingSpinner from "../components/common/LoadingSpinner";
import FileUpload from "../components/common/FileUpload";
import { StatusBadge } from "../components/common/Badge";
import { formatDate, formatFileSize, getFileIcon } from "../utils/formatters";
import { JENIS_ARSIP, TAHUN_OPTIONS } from "../utils/constants";

// ── Form Component ──────────────────────────────────────────────
function ArsipForm({ initial, onSubmit, loading }) {
  const [form, setForm] = useState({
    nama_dokumen: "",
    jenis_dokumen: "",
    tahun: "",
    tanggal: "",
    deskripsi: "",
    status: "aktif",
    ...initial,
  });
  const [file, setFile] = useState(null);

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v ?? ""));
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
            placeholder="Nama dokumen"
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
            {JENIS_ARSIP.map((j) => (
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
            {TAHUN_OPTIONS.map((t) => (
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
            placeholder="Deskripsi (opsional)"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="label">File Dokumen</label>
          <FileUpload
            file={file}
            onChange={setFile}
            accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.png"
            label="Upload PDF, Word, Excel, atau Gambar"
          />
          {initial?.file_name && !file && (
            <p className="text-xs text-slate-400 mt-1">
              File saat ini:{" "}
              <span className="font-medium">{initial.file_name}</span>
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
              : "Tambah Arsip"}
        </button>
      </div>
    </form>
  );
}

// ── Detail Modal ─────────────────────────────────────────────────
function ArsipDetail({ arsip }) {
  const rows = [
    ["Nama Dokumen", arsip.nama_dokumen],
    ["Jenis Dokumen", arsip.jenis_dokumen],
    ["Tahun", arsip.tahun],
    ["Tanggal", formatDate(arsip.tanggal)],
    ["Status", <StatusBadge status={arsip.status} />],
    ["Dibuat Oleh", arsip.nama_pembuat || "-"],
    ["Tanggal Input", formatDate(arsip.created_at)],
    ["Deskripsi", arsip.deskripsi || "-"],
  ];
  return (
    <div className="p-6 space-y-3">
      {rows.map(([label, val]) => (
        <div key={label} className="grid grid-cols-3 gap-2">
          <p className="text-sm text-slate-500 font-medium">{label}</p>
          <div className="col-span-2 text-sm text-slate-800">{val}</div>
        </div>
      ))}
      {arsip.file_name && (
        <div className="flex items-center gap-3 mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200">
          <span className="text-xl">{getFileIcon(arsip.file_type)}</span>
          <div>
            <p className="text-sm font-medium text-slate-700">
              {arsip.file_name}
            </p>
            <p className="text-xs text-slate-400">
              {formatFileSize(arsip.file_size)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────
export default function ArsipPage() {
  const toast = useToast();
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
  const [showFilter, setShowFilter] = useState(false);

  const [modal, setModal] = useState({ type: null, data: null });
  const [submitting, setSub] = useState(false);
  const [deleting, setDel] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await arsipApi.getAll({
        page: filters.page,
        limit: 10,
        search: filters.search,
        jenis: filters.jenis,
        tahun: filters.tahun,
      });
      setData(res.data.data);
      setPagination(res.data.pagination);
    } catch {
      toast.error("Gagal memuat data");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const setFilter = (k) => (v) =>
    setFilters((p) => ({ ...p, [k]: v, page: 1 }));

  const openModal = (type, data = null) => setModal({ type, data });
  const closeModal = () => setModal({ type: null, data: null });

  const handleCreate = async (fd) => {
    setSub(true);
    try {
      await arsipApi.create(fd);
      toast.success("Arsip berhasil ditambahkan");
      closeModal();
      fetchData();
    } catch (e) {
      toast.error(e.response?.data?.message || "Gagal menambah");
    } finally {
      setSub(false);
    }
  };

  const handleUpdate = async (fd) => {
    setSub(true);
    try {
      await arsipApi.update(modal.data.id, fd);
      toast.success("Arsip berhasil diperbarui");
      closeModal();
      fetchData();
    } catch (e) {
      toast.error(e.response?.data?.message || "Gagal memperbarui");
    } finally {
      setSub(false);
    }
  };

  const handleDelete = async () => {
    setDel(true);
    try {
      await arsipApi.delete(modal.data.id);
      toast.success("Arsip berhasil dihapus");
      closeModal();
      fetchData();
    } catch {
      toast.error("Gagal menghapus");
    } finally {
      setDel(false);
    }
  };

  const handleDownload = async (arsip) => {
    const id = toast.loading("Mengunduh file...");
    try {
      const res = await arsipApi.download(arsip.id);
      const url = URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = arsip.file_name;
      a.click();
      URL.revokeObjectURL(url);
      toast.dismiss(id);
      toast.success("File berhasil diunduh");
    } catch {
      toast.dismiss(id);
      toast.error("Gagal mengunduh file");
    }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="page-title">Arsip Perencanaan</h1>
          <p className="text-sm text-slate-400">
            Kelola dokumen perencanaan desa
          </p>
        </div>
        {canEdit && (
          <button onClick={() => openModal("create")} className="btn-primary">
            <HiPlus className="h-4 w-4" /> Tambah Arsip
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="card p-4">
        <div className="flex flex-wrap gap-3">
          <SearchBar
            value={filters.search}
            onChange={setFilter("search")}
            placeholder="Cari nama dokumen..."
            className="flex-1 min-w-48"
          />
          <select
            className="input-field w-44"
            value={filters.jenis}
            onChange={(e) => setFilter("jenis")(e.target.value)}
          >
            <option value="">Semua Jenis</option>
            {JENIS_ARSIP.map((j) => (
              <option key={j} value={j}>
                {j}
              </option>
            ))}
          </select>
          <select
            className="input-field w-32"
            value={filters.tahun}
            onChange={(e) => setFilter("tahun")(e.target.value)}
          >
            <option value="">Semua Tahun</option>
            {TAHUN_OPTIONS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        ) : data.length === 0 ? (
          <EmptyState
            icon="📂"
            title="Belum ada arsip"
            description="Tambahkan dokumen arsip perencanaan"
            action={
              canEdit && (
                <button
                  onClick={() => openModal("create")}
                  className="btn-primary mt-2"
                >
                  <HiPlus className="h-4 w-4" /> Tambah Arsip
                </button>
              )
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
                      Tanggal
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
                          <span className="text-lg">
                            {getFileIcon(item.file_type)}
                          </span>
                          <div>
                            <p className="font-medium text-slate-800 max-w-xs truncate">
                              {item.nama_dokumen}
                            </p>
                            <p className="text-xs text-slate-400">
                              {formatFileSize(item.file_size)}
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
                      <td className="px-4 py-3 text-slate-600 hidden lg:table-cell">
                        {formatDate(item.tanggal)}
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
                            <button
                              title="Download"
                              onClick={() => handleDownload(item)}
                              className="p-1.5 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            >
                              <HiArrowDownTray className="h-4 w-4" />
                            </button>
                          )}
                          {canEdit && (
                            <>
                              <button
                                title="Edit"
                                onClick={() => openModal("edit", item)}
                                className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                              >
                                <HiPencilSquare className="h-4 w-4" />
                              </button>
                              <button
                                title="Hapus"
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

      {/* Modals */}
      <Modal
        isOpen={modal.type === "create"}
        onClose={closeModal}
        title="Tambah Arsip Perencanaan"
        size="lg"
      >
        <ArsipForm onSubmit={handleCreate} loading={submitting} />
      </Modal>

      <Modal
        isOpen={modal.type === "edit"}
        onClose={closeModal}
        title="Edit Arsip"
        size="lg"
      >
        {modal.data && (
          <ArsipForm
            initial={modal.data}
            onSubmit={handleUpdate}
            loading={submitting}
          />
        )}
      </Modal>

      <Modal
        isOpen={modal.type === "view"}
        onClose={closeModal}
        title="Detail Arsip"
        size="md"
      >
        {modal.data && <ArsipDetail arsip={modal.data} />}
      </Modal>

      <ConfirmDialog
        isOpen={modal.type === "delete"}
        onClose={closeModal}
        onConfirm={handleDelete}
        loading={deleting}
        title="Hapus Arsip?"
        message={`Dokumen "${modal.data?.nama_dokumen}" akan dihapus.`}
      />
    </div>
  );
}
