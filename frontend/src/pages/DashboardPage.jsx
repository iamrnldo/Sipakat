import { useEffect, useState } from "react";
import {
  HiDocumentText,
  HiUsers,
  HiBanknotes,
  HiChartBar,
} from "react-icons/hi2";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { dashboardApi } from "../api/dashboardApi";
import StatCard from "../components/dashboard/StatCard";
import ActivityFeed from "../components/dashboard/ActivityFeed";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { formatDate } from "../utils/formatters";

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardApi
      .getStats()
      .then((r) => setData(r.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );

  const {
    statistik,
    arsip_per_tahun,
    keuangan_per_tahun,
    aktivitas_terbaru,
    dokumen_terbaru,
  } = data || {};

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div>
        <h1 className="page-title">Dashboard</h1>
        <p className="text-sm text-slate-400 mt-0.5">
          Ringkasan data pengarsipan SIPAKAT
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Arsip Perencanaan"
          value={statistik?.jumlah_arsip_perencanaan}
          icon={HiDocumentText}
          color="blue"
          trend="Total dokumen aktif"
        />
        <StatCard
          title="Aparatur Desa"
          value={statistik?.jumlah_aparatur_desa}
          icon={HiUsers}
          color="green"
          trend="Status aktif"
        />
        <StatCard
          title="Dokumen Keuangan"
          value={statistik?.jumlah_dokumen_keuangan}
          icon={HiBanknotes}
          color="yellow"
          trend="Total dokumen aktif"
        />
        <StatCard
          title="Total Dokumen"
          value={
            (statistik?.jumlah_arsip_perencanaan || 0) +
            (statistik?.jumlah_dokumen_keuangan || 0)
          }
          icon={HiChartBar}
          color="purple"
          trend="Gabungan semua modul"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Arsip per tahun */}
        <div className="card p-5">
          <h2 className="text-base font-semibold text-slate-700 mb-4">
            Arsip Perencanaan per Tahun
          </h2>
          {arsip_per_tahun?.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={arsip_per_tahun} barSize={32}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="tahun" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ borderRadius: 8, fontSize: 13 }}
                  formatter={(v) => [v, "Dokumen"]}
                />
                <Bar dataKey="jumlah" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-48 text-slate-400 text-sm">
              Belum ada data
            </div>
          )}
        </div>

        {/* Keuangan per tahun */}
        <div className="card p-5">
          <h2 className="text-base font-semibold text-slate-700 mb-4">
            Keuangan Desa per Tahun
          </h2>
          {keuangan_per_tahun?.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={keuangan_per_tahun} barSize={32}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="tahun" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ borderRadius: 8, fontSize: 13 }}
                  formatter={(v) => [v, "Dokumen"]}
                />
                <Bar dataKey="jumlah" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-48 text-slate-400 text-sm">
              Belum ada data
            </div>
          )}
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Dokumen Terbaru */}
        <div className="lg:col-span-2 card">
          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="text-base font-semibold text-slate-700">
              Dokumen Terbaru
            </h2>
          </div>
          <div className="divide-y divide-slate-50">
            {dokumen_terbaru?.length > 0 ? (
              dokumen_terbaru.map((d, i) => (
                <div
                  key={i}
                  className="px-5 py-3 flex items-center gap-3 hover:bg-slate-50"
                >
                  <div
                    className={`h-8 w-8 rounded-lg flex items-center justify-center text-sm
                  ${d.tipe === "arsip" ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"}`}
                  >
                    {d.tipe === "arsip" ? "📄" : "💰"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700 truncate">
                      {d.nama_dokumen}
                    </p>
                    <p className="text-xs text-slate-400">
                      {d.jenis_dokumen} · {formatDate(d.created_at)}
                    </p>
                  </div>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium
                  ${d.tipe === "arsip" ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"}`}
                  >
                    {d.tipe === "arsip" ? "Arsip" : "Keuangan"}
                  </span>
                </div>
              ))
            ) : (
              <div className="px-5 py-10 text-center text-slate-400 text-sm">
                Belum ada dokumen
              </div>
            )}
          </div>
        </div>

        {/* Aktivitas Terbaru */}
        <div className="card">
          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="text-base font-semibold text-slate-700">
              Aktivitas Terbaru
            </h2>
          </div>
          <div className="p-4">
            <ActivityFeed activities={aktivitas_terbaru || []} />
          </div>
        </div>
      </div>
    </div>
  );
}
