import { useState, useEffect, useCallback } from "react";
import {
  HiPlus,
  HiArrowDownTray,
  HiPencilSquare,
  HiTrash,
  HiEye,
  HiShare,
} from "react-icons/hi2";
import { keuanganApi } from "../api/keuanganApi";
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
import {
  formatDate,
  formatFileSize,
  formatCurrency,
  getFileIcon,
} from "../utils/formatters";
import { JENIS_KEUANGAN, TAHUN_OPTIONS } from "../utils/constants";

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
            {JENIS_KEUANGAN.map((j) => (
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
        <div>
          <label className="label">Nominal (Rp)</label>
          <input
            type="number"
            className="input-field"
            value={form.nominal || ""}
            onChange={set("nominal")}
            placeholder="0"
            min="0"
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
          />
        </div>
        <div className="sm:col-span-2">
          <label className="label">File Dokumen</label>
          <FileUpload
            file={file}
            onChange={setFile}
            accept=".pdf,.doc,.docx,.xls,.xlsx"
            label="Upload PDF, Word, atau Excel"
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
              : "Tambah Dokumen"}
        </button>
      </div>
    </form>
  );
}

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
    ["Deskripsi", d.deskripsi || "-"],
  ];
  return (
    <div className="p-6 space-y-2.5">
      {rows.map(([label, val]) => (
        <div
          key={label}
          className="grid grid-cols-3 gap-2 py-1.5 border-b border-slate-50"
        >
          <p className="text-xs text-slate-400 font-medium">{label}</p>
          <div className="col-span-2 text-sm text-slate-800">{val}</div>
        </div>
      ))}
      {d.file_name && (
        <div className="flex items-center gap-3 mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
          <span className="text-xl">{getFileIcon(d.file_type)}</span>
          <div>
            <p className="text-sm font-medium">{d.file_name}</p>
            <p className="text-xs text-slate-400">
              {formatFileSize(d.file_size)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function KeuanganPage() {
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
  const [modal, setModal] = useState({ type: null, data: null });
  const [submitting, setSub] = useState(false);
  const [deleting, setDel] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await keuanganApi.getAll({
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

  const openModal = (type, d = null) => setModal({ type, data: d });
  const closeModal = () => setModal({ type: null, data: null });

  const handleCreate = async (fd) => {
    setSub(true);
    try {
      await keuanganApi.create(fd);
      toast.success("Dokumen berhasil ditambahkan");
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
      await keuanganApi.update(modal.data.id, fd);
      toast.success("Dokumen berhasil diperbarui");
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
      await keuanganApi.delete(modal.data.id);
      toast.success("Dokumen berhasil dihapus");
      closeModal();
      fetchData();
    } catch {
      toast.error("Gagal menghapus");
    } finally {
      setDel(false);
    }
  };

  const handleDownload = async (item) => {
    const tid = toast.loading("Mengunduh...");
    try {
      const res = await keuanganApi.download(item.id);
      const url = URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = item.file_name;
      a.click();
      URL.revokeObjectURL(url);
      toast.dismiss(tid);
      toast.success("File berhasil diunduh");
    } catch {
      toast.dismiss(tid);
      toast.error("Gagal mengunduh");
    }
  };

  const handleShare = async (item) => {
    try {
      const res = await keuanganApi.share(item.id);
      const url = res.data.data.share_url;
      if (url) {
        navigator.clipboard.writeText(url);
        toast.success("Link disalin ke clipboard");
      } else toast.info("File tidak tersedia untuk di-share");
    } catch {
      toast.error("Gagal mendapatkan link");
    }
  };

  return (
    <div className="space-y-4 animate-fade-in">
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

      {/* Filter */}
      <div className="card p-4 flex flex-wrap gap-3">
        <SearchBar
          value={filters.search}
          onChange={(v) => setFilters((p) => ({ ...p, search: v, page: 1 }))}
          placeholder="Cari dokumen..."
          className="flex-1 min-w-48"
        />
        <select
          className="input-field w-44"
          value={filters.jenis}
          onChange={(e) =>
            setFilters((p) => ({ ...p, jenis: e.target.value, page: 1 }))
          }
        >
          <option value="">Semua Jenis</option>
          {JENIS_KEUANGAN.map((j) => (
            <option key={j} value={j}>
              {j}
            </option>
          ))}
        </select>
        <select
          className="input-field w-32"
          value={filters.tahun}
          onChange={(e) =>
            setFilters((p) => ({ ...p, tahun: e.target.value, page: 1 }))
          }
        >
          <option value="">Semua Tahun</option>
          {TAHUN_OPTIONS.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        ) : data.length === 0 ? (
          <EmptyState
            icon="💰"
            title="Belum ada dokumen keuangan"
            description="Tambahkan dokumen keuangan desa"
            action={
              canEdit && (
                <button
                  onClick={() => openModal("create")}
                  className="btn-primary mt-2"
                >
                  <HiPlus className="h-4 w-4" />
                  Tambah
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
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">
                      Nama Dokumen
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase hidden md:table-cell">
                      Jenis
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase hidden sm:table-cell">
                      Tahun
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase hidden lg:table-cell">
                      Nominal
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">
                      Status
                    </th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase">
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
                      <td className="px-4 py-3 text-slate-600 hidden lg:table-cell font-medium">
                        {formatCurrency(item.nominal)}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={item.status} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openModal("view", item)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                          >
                            <HiEye className="h-4 w-4" />
                          </button>
                          {item.file_path && (
                            <>
                              <button
                                onClick={() => handleDownload(item)}
                                className="p-1.5 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg"
                              >
                                <HiArrowDownTray className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleShare(item)}
                                className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg"
                              >
                                <HiShare className="h-4 w-4" />
                              </button>
                            </>
                          )}
                          {canEdit && (
                            <>
                              <button
                                onClick={() => openModal("edit", item)}
                                className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg"
                              >
                                <HiPencilSquare className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => openModal("delete", item)}
                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
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
        title="Detail Keuangan"
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
        message={`"${modal.data?.nama_dokumen}" akan dihapus.`}
      />
    </div>
  );
}
