import { useState, useEffect, useCallback } from "react";
import {
  HiPlus,
  HiPencilSquare,
  HiTrash,
  HiEye,
  HiUsers,
} from "react-icons/hi2";
import { kepegawaianApi } from "../api/kepegawaianApi";
import { useToast } from "../hooks/useToast";
import { useAuth } from "../hooks/useAuth";
import Modal from "../components/common/Modal";
import ConfirmDialog from "../components/common/ConfirmDialog";
import Pagination from "../components/common/Pagination";
import SearchBar from "../components/common/SearchBar";
import EmptyState from "../components/common/EmptyState";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { StatusBadge } from "../components/common/Badge";
import { formatDate, getInitials } from "../utils/formatters";
import { STATUS_APARATUR, GOLONGAN } from "../utils/constants";

// ── Form ──────────────────────────────────────────────────────────
function AparaturForm({ initial, onSubmit, loading }) {
  const [form, setForm] = useState({
    nama: "",
    nip: "",
    jabatan: "",
    status: "aktif",
    no_hp: "",
    email: "",
    alamat: "",
    tanggal_lahir: "",
    tanggal_bergabung: "",
    pendidikan: "",
    golongan: "",
    keterangan: "",
    ...initial,
  });
  const [foto, setFoto] = useState(null);
  const [preview, setPrev] = useState(
    initial?.foto ? `http://localhost:5000${initial.foto}` : null,
  );

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleFoto = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFoto(f);
    setPrev(URL.createObjectURL(f));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v ?? ""));
    if (foto) fd.append("foto", foto);
    onSubmit(fd);
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-4">
      {/* Foto */}
      <div className="flex items-center gap-4">
        <div className="h-20 w-20 rounded-2xl bg-slate-100 overflow-hidden flex items-center justify-center shrink-0">
          {preview ? (
            <img src={preview} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="text-2xl font-bold text-slate-400">
              {getInitials(form.nama)}
            </span>
          )}
        </div>
        <div>
          <label className="label">Foto Aparatur</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFoto}
            className="text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3
                       file:rounded-lg file:border-0 file:text-xs file:font-medium
                       file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="label">
            Nama Lengkap <span className="text-red-500">*</span>
          </label>
          <input
            className="input-field"
            value={form.nama}
            onChange={set("nama")}
            required
          />
        </div>
        <div>
          <label className="label">NIP</label>
          <input
            className="input-field"
            value={form.nip || ""}
            onChange={set("nip")}
            placeholder="Opsional"
          />
        </div>
        <div>
          <label className="label">
            Jabatan <span className="text-red-500">*</span>
          </label>
          <input
            className="input-field"
            value={form.jabatan}
            onChange={set("jabatan")}
            required
          />
        </div>
        <div>
          <label className="label">Status</label>
          <select
            className="input-field"
            value={form.status}
            onChange={set("status")}
          >
            {STATUS_APARATUR.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Golongan</label>
          <select
            className="input-field"
            value={form.golongan || ""}
            onChange={set("golongan")}
          >
            <option value="">Pilih golongan</option>
            {GOLONGAN.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Pendidikan</label>
          <select
            className="input-field"
            value={form.pendidikan || ""}
            onChange={set("pendidikan")}
          >
            <option value="">Pilih pendidikan</option>
            {["SD", "SMP", "SMA/SMK", "D3", "S1", "S2", "S3"].map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">No HP</label>
          <input
            className="input-field"
            value={form.no_hp || ""}
            onChange={set("no_hp")}
          />
        </div>
        <div>
          <label className="label">Email</label>
          <input
            type="email"
            className="input-field"
            value={form.email || ""}
            onChange={set("email")}
          />
        </div>
        <div>
          <label className="label">Tanggal Lahir</label>
          <input
            type="date"
            className="input-field"
            value={form.tanggal_lahir?.slice(0, 10) || ""}
            onChange={set("tanggal_lahir")}
          />
        </div>
        <div>
          <label className="label">Tanggal Bergabung</label>
          <input
            type="date"
            className="input-field"
            value={form.tanggal_bergabung?.slice(0, 10) || ""}
            onChange={set("tanggal_bergabung")}
          />
        </div>
        <div className="sm:col-span-2">
          <label className="label">Alamat</label>
          <textarea
            className="input-field resize-none"
            rows={2}
            value={form.alamat || ""}
            onChange={set("alamat")}
          />
        </div>
        <div className="sm:col-span-2">
          <label className="label">Keterangan</label>
          <textarea
            className="input-field resize-none"
            rows={2}
            value={form.keterangan || ""}
            onChange={set("keterangan")}
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading
            ? "Menyimpan..."
            : initial?.id
              ? "Simpan Perubahan"
              : "Tambah Aparatur"}
        </button>
      </div>
    </form>
  );
}

// ── Detail ────────────────────────────────────────────────────────
function AparaturDetail({ data: a }) {
  const rows = [
    ["NIP", a.nip || "-"],
    ["Jabatan", a.jabatan],
    ["Status", <StatusBadge status={a.status} />],
    ["Golongan", a.golongan || "-"],
    ["Pendidikan", a.pendidikan || "-"],
    ["No HP", a.no_hp || "-"],
    ["Email", a.email || "-"],
    ["Tanggal Lahir", formatDate(a.tanggal_lahir)],
    ["Tanggal Bergabung", formatDate(a.tanggal_bergabung)],
    ["Alamat", a.alamat || "-"],
    ["Keterangan", a.keterangan || "-"],
  ];
  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <div className="h-16 w-16 rounded-2xl bg-blue-100 overflow-hidden flex items-center justify-center">
          {a.foto ? (
            <img
              src={`http://localhost:5000${a.foto}`}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-xl font-bold text-blue-600">
              {getInitials(a.nama)}
            </span>
          )}
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-800">{a.nama}</h3>
          <p className="text-sm text-slate-500">{a.jabatan}</p>
        </div>
      </div>
      <div className="space-y-2.5">
        {rows.map(([label, val]) => (
          <div
            key={label}
            className="grid grid-cols-3 gap-2 py-1.5 border-b border-slate-50"
          >
            <p className="text-xs text-slate-400 font-medium">{label}</p>
            <div className="col-span-2 text-sm text-slate-700">{val}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Card (mobile) ─────────────────────────────────────────────────
function AparaturCard({ item, onView, onEdit, onDelete, canEdit }) {
  return (
    <div className="card p-4 flex items-center gap-4">
      <div className="h-12 w-12 rounded-xl bg-blue-100 overflow-hidden flex items-center justify-center shrink-0">
        {item.foto ? (
          <img
            src={`http://localhost:5000${item.foto}`}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="text-base font-bold text-blue-600">
            {getInitials(item.nama)}
          </span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-slate-800 truncate">{item.nama}</p>
        <p className="text-xs text-slate-500">{item.jabatan}</p>
        {item.nip && <p className="text-xs text-slate-400">NIP: {item.nip}</p>}
      </div>
      <div className="flex flex-col items-end gap-2">
        <StatusBadge status={item.status} />
        <div className="flex gap-1">
          <button
            onClick={() => onView(item)}
            className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg"
          >
            <HiEye className="h-4 w-4" />
          </button>
          {canEdit && (
            <button
              onClick={() => onEdit(item)}
              className="p-1.5 text-slate-400 hover:text-amber-600 rounded-lg"
            >
              <HiPencilSquare className="h-4 w-4" />
            </button>
          )}
          {canEdit && (
            <button
              onClick={() => onDelete(item)}
              className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg"
            >
              <HiTrash className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────
export default function KepegawaianPage() {
  const toast = useToast();
  const { user } = useAuth();
  const canEdit = user?.hak_akses !== "viewer";

  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: "", status: "", page: 1 });
  const [modal, setModal] = useState({ type: null, data: null });
  const [submitting, setSub] = useState(false);
  const [deleting, setDel] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await kepegawaianApi.getAll({
        page: filters.page,
        limit: 10,
        search: filters.search,
        status: filters.status,
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
      await kepegawaianApi.create(fd);
      toast.success("Aparatur berhasil ditambahkan");
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
      await kepegawaianApi.update(modal.data.id, fd);
      toast.success("Data aparatur berhasil diperbarui");
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
      await kepegawaianApi.delete(modal.data.id);
      toast.success("Aparatur berhasil dihapus");
      closeModal();
      fetchData();
    } catch {
      toast.error("Gagal menghapus");
    } finally {
      setDel(false);
    }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="page-title">Kepegawaian Aparatur</h1>
          <p className="text-sm text-slate-400">Data aparatur desa</p>
        </div>
        {canEdit && (
          <button onClick={() => openModal("create")} className="btn-primary">
            <HiPlus className="h-4 w-4" /> Tambah Aparatur
          </button>
        )}
      </div>

      {/* Filter */}
      <div className="card p-4 flex flex-wrap gap-3">
        <SearchBar
          value={filters.search}
          onChange={(v) => setFilters((p) => ({ ...p, search: v, page: 1 }))}
          placeholder="Cari nama / NIP..."
          className="flex-1 min-w-48"
        />
        <select
          className="input-field w-40"
          value={filters.status}
          onChange={(e) =>
            setFilters((p) => ({ ...p, status: e.target.value, page: 1 }))
          }
        >
          <option value="">Semua Status</option>
          {STATUS_APARATUR.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      ) : data.length === 0 ? (
        <EmptyState
          icon="👥"
          title="Belum ada aparatur"
          description="Tambahkan data aparatur desa"
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
        <div className="space-y-3">
          {/* Desktop Table */}
          <div className="card overflow-hidden hidden md:block">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Aparatur
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      NIP
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Jabatan
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
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-xl bg-blue-100 overflow-hidden flex items-center justify-center shrink-0">
                            {item.foto ? (
                              <img
                                src={`http://localhost:5000${item.foto}`}
                                alt=""
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <span className="text-xs font-bold text-blue-600">
                                {getInitials(item.nama)}
                              </span>
                            )}
                          </div>
                          <span className="font-medium text-slate-800">
                            {item.nama}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {item.nip || "-"}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {item.jabatan}
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
                          {canEdit && (
                            <button
                              onClick={() => openModal("edit", item)}
                              className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg"
                            >
                              <HiPencilSquare className="h-4 w-4" />
                            </button>
                          )}
                          {canEdit && (
                            <button
                              onClick={() => openModal("delete", item)}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                            >
                              <HiTrash className="h-4 w-4" />
                            </button>
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
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {data.map((item) => (
              <AparaturCard
                key={item.id}
                item={item}
                canEdit={canEdit}
                onView={(d) => openModal("view", d)}
                onEdit={(d) => openModal("edit", d)}
                onDelete={(d) => openModal("delete", d)}
              />
            ))}
            <Pagination
              pagination={pagination}
              onPageChange={(p) => setFilters((prev) => ({ ...prev, page: p }))}
            />
          </div>
        </div>
      )}

      {/* Modals */}
      <Modal
        isOpen={modal.type === "create"}
        onClose={closeModal}
        title="Tambah Aparatur"
        size="lg"
      >
        <AparaturForm onSubmit={handleCreate} loading={submitting} />
      </Modal>
      <Modal
        isOpen={modal.type === "edit"}
        onClose={closeModal}
        title="Edit Aparatur"
        size="lg"
      >
        {modal.data && (
          <AparaturForm
            initial={modal.data}
            onSubmit={handleUpdate}
            loading={submitting}
          />
        )}
      </Modal>
      <Modal
        isOpen={modal.type === "view"}
        onClose={closeModal}
        title="Detail Aparatur"
        size="md"
      >
        {modal.data && <AparaturDetail data={modal.data} />}
      </Modal>
      <ConfirmDialog
        isOpen={modal.type === "delete"}
        onClose={closeModal}
        onConfirm={handleDelete}
        loading={deleting}
        title="Hapus Aparatur?"
        message={`Data "${modal.data?.nama}" akan dihapus permanen.`}
      />
    </div>
  );
}
