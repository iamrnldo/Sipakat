const { query } = require("../config/database");

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private
const getStats = async (req, res) => {
  try {
    // Jumlah arsip perencanaan
    const arsipCount = await query(
      "SELECT COUNT(*) FROM arsip_perencanaan WHERE status = 'aktif'",
    );

    // Jumlah aparatur desa
    const aparaturCount = await query(
      "SELECT COUNT(*) FROM kepegawaian_aparatur WHERE status = 'aktif'",
    );

    // Jumlah dokumen keuangan
    const keuanganCount = await query(
      "SELECT COUNT(*) FROM keuangan_desa WHERE status = 'aktif'",
    );

    // Dokumen terbaru
    const recentDokumen = await query(`
      SELECT 'arsip' as tipe, id, nama_dokumen, jenis_dokumen, created_at 
      FROM arsip_perencanaan WHERE status = 'aktif'
      UNION ALL
      SELECT 'keuangan' as tipe, id, nama_dokumen, jenis_dokumen, created_at 
      FROM keuangan_desa WHERE status = 'aktif'
      ORDER BY created_at DESC
      LIMIT 5
    `);

    // Statistik per tahun arsip
    const arsipPerTahun = await query(`
      SELECT tahun, COUNT(*) as jumlah 
      FROM arsip_perencanaan 
      WHERE status = 'aktif'
      GROUP BY tahun 
      ORDER BY tahun DESC
      LIMIT 5
    `);

    // Statistik per tahun keuangan
    const keuanganPerTahun = await query(`
      SELECT tahun, COUNT(*) as jumlah 
      FROM keuangan_desa 
      WHERE status = 'aktif'
      GROUP BY tahun 
      ORDER BY tahun DESC
      LIMIT 5
    `);

    // Aktivitas terbaru
    const aktivitasTerbaru = await query(`
      SELECT al.aksi, al.modul, al.deskripsi, al.created_at,
             u.nama_lengkap, u.foto
      FROM activity_log al
      LEFT JOIN users u ON al.user_id = u.id
      ORDER BY al.created_at DESC
      LIMIT 10
    `);

    res.status(200).json({
      success: true,
      data: {
        statistik: {
          jumlah_arsip_perencanaan: parseInt(arsipCount.rows[0].count),
          jumlah_aparatur_desa: parseInt(aparaturCount.rows[0].count),
          jumlah_dokumen_keuangan: parseInt(keuanganCount.rows[0].count),
        },
        dokumen_terbaru: recentDokumen.rows,
        arsip_per_tahun: arsipPerTahun.rows,
        keuangan_per_tahun: keuanganPerTahun.rows,
        aktivitas_terbaru: aktivitasTerbaru.rows,
      },
    });
  } catch (err) {
    console.error("Dashboard error:", err);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
    });
  }
};

module.exports = { getStats };
