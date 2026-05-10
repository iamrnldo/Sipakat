import { useState, useEffect } from "react";
import {
  HiPencilSquare,
  HiLockClosed,
  HiClock,
  HiDevicePhoneMobile,
  HiShieldCheck,
  HiUser,
  HiPlus,
} from "react-icons/hi2";

import { profilApi } from "../api/profilApi";
import { authApi } from "../api/authApi";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";
import Modal from "../components/common/Modal";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { HakAksesBadge, StatusBadge } from "../components/common/Badge";
import Pagination from "../components/common/Pagination";
import { formatDateTime, getInitials } from "../utils/formatters";
import { HAK_AKSES } from "../utils/constants";

// ── Edit Profil Form ──────────────────────────────────────────────
function EditProfilForm({ profil, onSubmit, loading }) {
  const [form, setForm] = useState({
    nama_lengkap: profil.nama_lengkap || "",
    email: profil.email || "",
    jabatan: profil.jabatan || "",
    no_hp: profil.no_hp || "",
    alamat: profil.alamat || "",
    catatan: profil.catatan || "",
  });
  const [foto, setFoto] = useState(null);
  const [preview, setPreview] = useState(
    profil.foto ? `http://localhost:5000${profil.foto}` : null,
  );

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleFoto = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFoto(f);
    setPreview(URL.createObjectURL(f));
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
        <div className="h-20 w-20 rounded-2xl overflow-hidden bg-blue-100 flex items-center justify-center shrink-0">
          {preview ? (
            <img src={preview} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="text-2xl font-bold text-blue-500">
              {getInitials(form.nama_lengkap)}
            </span>
          )}
        </div>
        <div>
          <label className="label">Foto Profil</label>
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
          <label className="label">Nama Lengkap</label>
          <input
            className="input-field"
            value={form.nama_lengkap}
            onChange={set("nama_lengkap")}
          />
        </div>
        <div>
          <label className="label">Email</label>
          <input
            type="email"
            className="input-field"
            value={form.email}
            onChange={set("email")}
          />
        </div>
        <div>
          <label className="label">Jabatan</label>
          <input
            className="input-field"
            value={form.jabatan}
            onChange={set("jabatan")}
          />
        </div>
        <div>
          <label className="label">No HP</label>
          <input
            className="input-field"
            value={form.no_hp}
            onChange={set("no_hp")}
          />
        </div>
        <div className="sm:col-span-2">
          <label className="label">Alamat</label>
          <textarea
            className="input-field resize-none"
            rows={2}
            value={form.alamat}
            onChange={set("alamat")}
          />
        </div>
        <div className="sm:col-span-2">
          <label className="label">Catatan</label>
          <textarea
            className="input-field resize-none"
            rows={2}
            value={form.catatan}
            onChange={set("catatan")}
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? "Menyimpan..." : "Simpan Perubahan"}
        </button>
      </div>
    </form>
  );
}

// ── Change Password Form ──────────────────────────────────────────
function ChangePasswordForm({ onSubmit, loading }) {
  const [form, setForm] = useState({
    password_lama: "",
    password_baru: "",
    konfirmasi_password: "",
  });
  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(form);
      }}
      className="p-6 space-y-4"
    >
      {[
        { key: "password_lama", label: "Password Lama" },
        { key: "password_baru", label: "Password Baru" },
        { key: "konfirmasi_password", label: "Konfirmasi Password Baru" },
      ].map(({ key, label }) => (
        <div key={key}>
          <label className="label">{label}</label>
          <input
            type="password"
            className="input-field"
            value={form[key]}
            onChange={set(key)}
            required
            minLength={key !== "password_lama" ? 6 : 1}
          />
        </div>
      ))}
      <div className="flex justify-end pt-2 border-t border-slate-100">
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? "Menyimpan..." : "Ubah Password"}
        </button>
      </div>
    </form>
  );
}

// ── Create User Form (Admin) ──────────────────────────────────────
function CreateUserForm({ onSubmit, loading }) {
  const [form, setForm] = useState({
    nama_lengkap: "",
    username: "",
    email: "",
    password: "",
    jabatan: "",
    hak_akses: "user",
  });
  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(form);
      }}
      className="p-6 space-y-4"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="label">
            Nama Lengkap <span className="text-red-500">*</span>
          </label>
          <input
            className="input-field"
            value={form.nama_lengkap}
            onChange={set("nama_lengkap")}
            required
          />
        </div>
        <div>
          <label className="label">
            Username <span className="text-red-500">*</span>
          </label>
          <input
            className="input-field"
            value={form.username}
            onChange={set("username")}
            required
          />
        </div>
        <div>
          <label className="label">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            className="input-field"
            value={form.email}
            onChange={set("email")}
            required
          />
        </div>
        <div>
          <label className="label">
            Password <span className="text-red-500">*</span>
          </label>
          <input
            type="password"
            className="input-field"
            value={form.password}
            onChange={set("password")}
            required
            minLength={6}
          />
        </div>
        <div>
          <label className="label">Jabatan</label>
          <input
            className="input-field"
            value={form.jabatan}
            onChange={set("jabatan")}
          />
        </div>
        <div>
          <label className="label">Hak Akses</label>
          <select
            className="input-field"
            value={form.hak_akses}
            onChange={set("hak_akses")}
          >
            {HAK_AKSES.map((h) => (
              <option key={h.value} value={h.value}>
                {h.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex justify-end pt-2 border-t border-slate-100">
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? "Membuat..." : "Buat User"}
        </button>
      </div>
    </form>
  );
}

// ── Main Page ─────────────────────────────────────────────────────
export default function ProfilPage() {
  const toast = useToast();
  const { user, updateUser } = useAuth();
  const isAdmin = user?.hak_akses === "admin";

  const [profil, setProfil] = useState(null);
  const [aktivitas, setAktivitas] = useState([]);
  const [perangkat, setPerangkat] = useState([]);
  const [users, setUsers] = useState([]);
  const [aktPagination, setAktPag] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("profil");
  const [modal, setModal] = useState({ type: null });
  const [submitting, setSub] = useState(false);

  useEffect(() => {
    profilApi
      .getProfil()
      .then((r) => setProfil(r.data.data))
      .catch(() => toast.error("Gagal memuat profil"))
      .finally(() => setLoading(false));
  }, []);

  const loadAktivitas = async (page = 1) => {
    const res = await profilApi.getAktivitas({ page, limit: 15 });
    setAktivitas(res.data.data);
    setAktPag(res.data.pagination);
  };

  const loadPerangkat = async () => {
    const res = await profilApi.getPerangkat();
    setPerangkat(res.data.data);
  };

  const loadUsers = async () => {
    const res = await profilApi.getAllUsers();
    setUsers(res.data.data);
  };

  useEffect(() => {
    if (tab === "aktivitas") loadAktivitas();
    if (tab === "perangkat") loadPerangkat();
    if (tab === "users" && isAdmin) loadUsers();
  }, [tab]);

  const handleUpdateProfil = async (fd) => {
    setSub(true);
    try {
      const res = await profilApi.updateProfil(fd);
      setProfil(res.data.data);
      updateUser(res.data.data);
      toast.success("Profil berhasil diperbarui");
      setModal({ type: null });
    } catch (e) {
      toast.error(e.response?.data?.message || "Gagal memperbarui");
    } finally {
      setSub(false);
    }
  };

  const handleChangePassword = async (data) => {
    setSub(true);
    try {
      await authApi.changePassword(data);
      toast.success("Password berhasil diubah");
      setModal({ type: null });
    } catch (e) {
      toast.error(e.response?.data?.message || "Gagal mengubah password");
    } finally {
      setSub(false);
    }
  };

  const handleCreateUser = async (data) => {
    setSub(true);
    try {
      await profilApi.createUser(data);
      toast.success("User berhasil dibuat");
      setModal({ type: null });
      loadUsers();
    } catch (e) {
      toast.error(e.response?.data?.message || "Gagal membuat user");
    } finally {
      setSub(false);
    }
  };

  const handleToggleStatus = async (u) => {
    const newStatus = u.status === "aktif" ? "nonaktif" : "aktif";
    try {
      await profilApi.updateUser(u.id, { status: newStatus });
      toast.success(`User ${newStatus}kan`);
      loadUsers();
    } catch {
      toast.error("Gagal mengubah status");
    }
  };

  const tabs = [
    { key: "profil", label: "Profil", icon: HiUser },
    { key: "aktivitas", label: "Aktivitas", icon: HiClockHistory },
    { key: "perangkat", label: "Perangkat", icon: HiDevicePhoneMobile },
    ...(isAdmin
      ? [{ key: "users", label: "Kelola User", icon: HiShieldCheck }]
      : []),
  ];

  if (loading)
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );

  return (
    <div className="space-y-4 animate-fade-in">
      <div>
        <h1 className="page-title">Profil Pengguna</h1>
        <p className="text-sm text-slate-400">Kelola informasi akun Anda</p>
      </div>

      {/* Profil Header Card */}
      <div className="card p-6">
        <div className="flex flex-wrap items-center gap-5">
          <div className="h-20 w-20 rounded-2xl bg-blue-100 overflow-hidden flex items-center justify-center shrink-0">
            {profil?.foto ? (
              <img
                src={`http://localhost:5000${profil.foto}`}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-2xl font-bold text-blue-600">
                {getInitials(profil?.nama_lengkap)}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-slate-800">
              {profil?.nama_lengkap}
            </h2>
            <p className="text-slate-500 text-sm">
              @{profil?.username} · {profil?.jabatan || "Tidak ada jabatan"}
            </p>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <HakAksesBadge hak={profil?.hak_akses} />
              <StatusBadge status={profil?.status} />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setModal({ type: "edit" })}
              className="btn-secondary"
            >
              <HiPencilSquare className="h-4 w-4" /> Edit Profil
            </button>
            <button
              onClick={() => setModal({ type: "password" })}
              className="btn-secondary"
            >
              <HiLockClosed className="h-4 w-4" /> Password
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="card overflow-hidden">
        <div className="flex border-b border-slate-200 overflow-x-auto">
          {tabs.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                tab === key
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              <Icon className="h-4 w-4" /> {label}
            </button>
          ))}
        </div>

        {/* Tab: Profil */}
        {tab === "profil" && profil && (
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              ["Nama Lengkap", profil.nama_lengkap],
              ["Username", profil.username],
              ["Email", profil.email],
              ["Jabatan", profil.jabatan || "-"],
              ["No HP", profil.no_hp || "-"],
              ["Hak Akses", <HakAksesBadge hak={profil.hak_akses} />],
              ["Status Akun", <StatusBadge status={profil.status} />],
              ["Terakhir Login", formatDateTime(profil.last_login)],
              ["Dibuat", formatDateTime(profil.created_at)],
            ].map(([label, val]) => (
              <div key={label} className="p-3 bg-slate-50 rounded-xl">
                <p className="text-xs text-slate-400 font-medium mb-1">
                  {label}
                </p>
                <div className="text-sm font-medium text-slate-800">{val}</div>
              </div>
            ))}
            {profil.alamat && (
              <div className="sm:col-span-2 p-3 bg-slate-50 rounded-xl">
                <p className="text-xs text-slate-400 font-medium mb-1">
                  Alamat
                </p>
                <p className="text-sm text-slate-800">{profil.alamat}</p>
              </div>
            )}
            {profil.catatan && (
              <div className="sm:col-span-2 p-3 bg-slate-50 rounded-xl">
                <p className="text-xs text-slate-400 font-medium mb-1">
                  Catatan
                </p>
                <p className="text-sm text-slate-800">{profil.catatan}</p>
              </div>
            )}
          </div>
        )}

        {/* Tab: Aktivitas */}
        {tab === "aktivitas" && (
          <div>
            {aktivitas.length === 0 ? (
              <div className="py-16 text-center text-slate-400 text-sm">
                Belum ada aktivitas
              </div>
            ) : (
              <>
                <div className="divide-y divide-slate-50">
                  {aktivitas.map((a, i) => (
                    <div
                      key={i}
                      className="px-6 py-3 flex items-start gap-3 hover:bg-slate-50"
                    >
                      <span
                        className={`shrink-0 mt-0.5 px-2 py-0.5 rounded-md text-xs font-medium
                        ${
                          {
                            AUTH: "bg-slate-100 text-slate-600",
                            ARSIP: "bg-blue-100 text-blue-700",
                            KEPEGAWAIAN: "bg-green-100 text-green-700",
                            KEUANGAN: "bg-amber-100 text-amber-700",
                            PROFIL: "bg-purple-100 text-purple-700",
                          }[a.modul] || "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {a.modul}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-700">{a.deskripsi}</p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {formatDateTime(a.created_at)} · {a.ip_address}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <Pagination
                  pagination={aktPagination}
                  onPageChange={loadAktivitas}
                />
              </>
            )}
          </div>
        )}

        {/* Tab: Perangkat */}
        {tab === "perangkat" && (
          <div className="divide-y divide-slate-100">
            {perangkat.length === 0 ? (
              <div className="py-16 text-center text-slate-400 text-sm">
                Belum ada riwayat login
              </div>
            ) : (
              perangkat.map((p, i) => (
                <div
                  key={i}
                  className="px-6 py-4 flex items-start gap-4 hover:bg-slate-50"
                >
                  <div className="h-10 w-10 bg-slate-100 rounded-xl flex items-center justify-center shrink-0">
                    <HiDevicePhoneMobile className="h-5 w-5 text-slate-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700">
                      {p.browser || "Unknown"} · {p.os || "Unknown"}
                    </p>
                    <p className="text-xs text-slate-400">
                      {p.ip_address} · {formatDateTime(p.created_at)}
                    </p>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium ${
                      p.status === "success"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {p.status === "success" ? "Berhasil" : "Gagal"}
                  </span>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab: Kelola User (Admin) */}
        {tab === "users" && isAdmin && (
          <div>
            <div className="px-4 py-3 border-b border-slate-100 flex justify-end">
              <button
                onClick={() => setModal({ type: "create-user" })}
                className="btn-primary"
              >
                <HiPlus className="h-4 w-4" /> Buat User
              </button>
            </div>
            {users.length === 0 ? (
              <div className="py-16 text-center text-slate-400 text-sm">
                Belum ada user
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">
                        Nama
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase hidden md:table-cell">
                        Email
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">
                        Hak Akses
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
                    {users.map((u) => (
                      <tr key={u.id} className="table-row-hover">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600 overflow-hidden">
                              {u.foto ? (
                                <img
                                  src={`http://localhost:5000${u.foto}`}
                                  alt=""
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                getInitials(u.nama_lengkap)
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-slate-800">
                                {u.nama_lengkap}
                              </p>
                              <p className="text-xs text-slate-400">
                                @{u.username}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-500 hidden md:table-cell">
                          {u.email}
                        </td>
                        <td className="px-4 py-3">
                          <HakAksesBadge hak={u.hak_akses} />
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={u.status} />
                        </td>
                        <td className="px-4 py-3 text-right">
                          {u.id !== user.id && (
                            <button
                              onClick={() => handleToggleStatus(u)}
                              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                                u.status === "aktif"
                                  ? "bg-red-50 text-red-600 hover:bg-red-100"
                                  : "bg-green-50 text-green-600 hover:bg-green-100"
                              }`}
                            >
                              {u.status === "aktif"
                                ? "Nonaktifkan"
                                : "Aktifkan"}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      <Modal
        isOpen={modal.type === "edit"}
        onClose={() => setModal({ type: null })}
        title="Edit Profil"
        size="lg"
      >
        {profil && (
          <EditProfilForm
            profil={profil}
            onSubmit={handleUpdateProfil}
            loading={submitting}
          />
        )}
      </Modal>

      <Modal
        isOpen={modal.type === "password"}
        onClose={() => setModal({ type: null })}
        title="Ubah Password"
        size="sm"
      >
        <ChangePasswordForm
          onSubmit={handleChangePassword}
          loading={submitting}
        />
      </Modal>

      <Modal
        isOpen={modal.type === "create-user"}
        onClose={() => setModal({ type: null })}
        title="Buat User Baru"
        size="md"
      >
        <CreateUserForm onSubmit={handleCreateUser} loading={submitting} />
      </Modal>
    </div>
  );
}
