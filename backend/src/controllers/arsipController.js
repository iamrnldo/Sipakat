const { query } = require("../config/database");
const fs = require("fs");
const path = require("path");

// @desc    Get all arsip perencanaan
// @route   GET /api/arsip
// @access  Private
const getAllArsip = async (req, res) => {
  const {
    page = 1,
    limit = 10,
    search = "",
    jenis = "",
    tahun = "",
    sort = "created_at",
    order = "DESC",
  } = req.query;

  const offset = (parseInt(page) - 1) * parseInt(limit);

  // Whitelist sort columns to prevent SQL injection
  const allowedSort = [
    "nama_dokumen",
    "jenis_dokumen",
    "tahun",
    "tanggal",
    "created_at",
  ];
  const sortField = allowedSort.includes(sort) ? `ap.${sort}` : "ap.created_at";
  const sortOrder = order.toUpperCase() === "ASC" ? "ASC" : "DESC";

  try {
    // Use table prefix on all columns to avoid ambiguity with JOIN
    let whereClause = "WHERE ap.status != 'hapus'";
    const params = [];
    let paramCount = 1;

    if (search) {
      whereClause += ` AND ap.nama_dokumen ILIKE $${paramCount}`;
      params.push(`%${search}%`);
      paramCount++;
    }

    if (jenis) {
      whereClause += ` AND ap.jenis_dokumen = $${paramCount}`;
      params.push(jenis);
      paramCount++;
    }

    if (tahun) {
      whereClause += ` AND ap.tahun = $${paramCount}`;
      params.push(tahun);
      paramCount++;
    }

    // Count query (no JOIN needed for count, improves performance)
    const countResult = await query(
      `SELECT COUNT(*) FROM arsip_perencanaan ap ${whereClause}`,
      params,
    );

    // Data query with JOIN
    const dataResult = await query(
      `SELECT ap.*, u.nama_lengkap AS nama_pembuat
       FROM arsip_perencanaan ap
       LEFT JOIN users u ON ap.dibuat_oleh = u.id
       ${whereClause}
       ORDER BY ${sortField} ${sortOrder}
       LIMIT $${paramCount} OFFSET $${paramCount + 1}`,
      [...params, parseInt(limit), offset],
    );

    const total = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(total / parseInt(limit));

    res.status(200).json({
      success: true,
      data: dataResult.rows,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        total_pages: totalPages,
        has_next: parseInt(page) < totalPages,
        has_prev: parseInt(page) > 1,
      },
    });
  } catch (err) {
    console.error("getAllArsip error:", err.message);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
    });
  }
};

// @desc    Get single arsip
// @route   GET /api/arsip/:id
// @access  Private
const getArsipById = async (req, res) => {
  try {
    const result = await query(
      `SELECT ap.*, u.nama_lengkap AS nama_pembuat
       FROM arsip_perencanaan ap
       LEFT JOIN users u ON ap.dibuat_oleh = u.id
       WHERE ap.id = $1 AND ap.status != 'hapus'`,
      [req.params.id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Arsip tidak ditemukan",
      });
    }

    res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (err) {
    console.error("getArsipById error:", err.message);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
    });
  }
};

// @desc    Create arsip
// @route   POST /api/arsip
// @access  Private (admin/user)
const createArsip = async (req, res) => {
  const { nama_dokumen, jenis_dokumen, tahun, tanggal, deskripsi } = req.body;

  if (!nama_dokumen || !jenis_dokumen || !tahun || !tanggal) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    return res.status(400).json({
      success: false,
      message: "Nama dokumen, jenis, tahun, dan tanggal wajib diisi",
    });
  }

  try {
    let filePath = null;
    let fileName = null;
    let fileSize = null;
    let fileType = null;

    if (req.file) {
      filePath = `/uploads/documents/${req.file.filename}`;
      fileName = req.file.originalname;
      fileSize = req.file.size;
      fileType = req.file.mimetype;
    }

    const result = await query(
      `INSERT INTO arsip_perencanaan
       (nama_dokumen, jenis_dokumen, tahun, tanggal, deskripsi,
        file_path, file_name, file_size, file_type, dibuat_oleh)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        nama_dokumen,
        jenis_dokumen,
        parseInt(tahun),
        tanggal,
        deskripsi || null,
        filePath,
        fileName,
        fileSize,
        fileType,
        req.user.id,
      ],
    );

    await query(
      `INSERT INTO activity_log (user_id, aksi, modul, deskripsi, ip_address)
       VALUES ($1, 'TAMBAH', 'ARSIP', $2, $3)`,
      [req.user.id, `Menambah arsip: ${nama_dokumen}`, req.ip],
    );

    res.status(201).json({
      success: true,
      message: "Arsip berhasil ditambahkan",
      data: result.rows[0],
    });
  } catch (err) {
    console.error("createArsip error:", err.message);
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
    });
  }
};

// @desc    Update arsip
// @route   PUT /api/arsip/:id
// @access  Private (admin/user)
const updateArsip = async (req, res) => {
  const { nama_dokumen, jenis_dokumen, tahun, tanggal, deskripsi, status } =
    req.body;

  try {
    const checkResult = await query(
      "SELECT * FROM arsip_perencanaan WHERE id = $1 AND status != 'hapus'",
      [req.params.id],
    );

    if (checkResult.rows.length === 0) {
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(404).json({
        success: false,
        message: "Arsip tidak ditemukan",
      });
    }

    const existing = checkResult.rows[0];
    let filePath = existing.file_path;
    let fileName = existing.file_name;
    let fileSize = existing.file_size;
    let fileType = existing.file_type;

    if (req.file) {
      // Hapus file lama jika ada
      if (existing.file_path) {
        const oldFilePath = path.join(__dirname, "../../", existing.file_path);
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }
      filePath = `/uploads/documents/${req.file.filename}`;
      fileName = req.file.originalname;
      fileSize = req.file.size;
      fileType = req.file.mimetype;
    }

    // Validate status value
    const allowedStatus = ["aktif", "arsip"];
    const newStatus =
      status && allowedStatus.includes(status) ? status : existing.status;

    const result = await query(
      `UPDATE arsip_perencanaan
       SET nama_dokumen = $1, jenis_dokumen = $2, tahun = $3, tanggal = $4,
           deskripsi = $5, file_path = $6, file_name = $7, file_size = $8,
           file_type = $9, status = $10, updated_at = NOW()
       WHERE id = $11
       RETURNING *`,
      [
        nama_dokumen || existing.nama_dokumen,
        jenis_dokumen || existing.jenis_dokumen,
        tahun ? parseInt(tahun) : existing.tahun,
        tanggal || existing.tanggal,
        deskripsi !== undefined ? deskripsi : existing.deskripsi,
        filePath,
        fileName,
        fileSize,
        fileType,
        newStatus,
        req.params.id,
      ],
    );

    await query(
      `INSERT INTO activity_log (user_id, aksi, modul, deskripsi, ip_address)
       VALUES ($1, 'EDIT', 'ARSIP', $2, $3)`,
      [req.user.id, `Mengubah arsip: ${result.rows[0].nama_dokumen}`, req.ip],
    );

    res.status(200).json({
      success: true,
      message: "Arsip berhasil diperbarui",
      data: result.rows[0],
    });
  } catch (err) {
    console.error("updateArsip error:", err.message);
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
    });
  }
};

// @desc    Delete arsip (soft delete)
// @route   DELETE /api/arsip/:id
// @access  Private (admin/user)
const deleteArsip = async (req, res) => {
  try {
    const checkResult = await query(
      "SELECT * FROM arsip_perencanaan WHERE id = $1 AND status != 'hapus'",
      [req.params.id],
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Arsip tidak ditemukan",
      });
    }

    await query(
      "UPDATE arsip_perencanaan SET status = 'hapus', updated_at = NOW() WHERE id = $1",
      [req.params.id],
    );

    await query(
      `INSERT INTO activity_log (user_id, aksi, modul, deskripsi, ip_address)
       VALUES ($1, 'HAPUS', 'ARSIP', $2, $3)`,
      [
        req.user.id,
        `Menghapus arsip: ${checkResult.rows[0].nama_dokumen}`,
        req.ip,
      ],
    );

    res.status(200).json({
      success: true,
      message: "Arsip berhasil dihapus",
    });
  } catch (err) {
    console.error("deleteArsip error:", err.message);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
    });
  }
};

// @desc    Download arsip file
// @route   GET /api/arsip/:id/download
// @access  Private
const downloadArsip = async (req, res) => {
  try {
    const result = await query(
      "SELECT * FROM arsip_perencanaan WHERE id = $1 AND status != 'hapus'",
      [req.params.id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Arsip tidak ditemukan",
      });
    }

    const arsip = result.rows[0];

    if (!arsip.file_path) {
      return res.status(404).json({
        success: false,
        message: "File tidak tersedia untuk arsip ini",
      });
    }

    const filePath = path.join(__dirname, "../../", arsip.file_path);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: "File tidak ditemukan di server",
      });
    }

    await query(
      `INSERT INTO activity_log (user_id, aksi, modul, deskripsi, ip_address)
       VALUES ($1, 'DOWNLOAD', 'ARSIP', $2, $3)`,
      [req.user.id, `Download arsip: ${arsip.nama_dokumen}`, req.ip],
    );

    res.download(filePath, arsip.file_name || path.basename(filePath));
  } catch (err) {
    console.error("downloadArsip error:", err.message);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
    });
  }
};

// @desc    Get distinct jenis dokumen
// @route   GET /api/arsip/jenis
// @access  Private
const getJenisDokumen = async (req, res) => {
  try {
    const result = await query(
      `SELECT DISTINCT jenis_dokumen
       FROM arsip_perencanaan
       WHERE status != 'hapus' AND jenis_dokumen IS NOT NULL
       ORDER BY jenis_dokumen`,
    );

    res.status(200).json({
      success: true,
      data: result.rows.map((r) => r.jenis_dokumen),
    });
  } catch (err) {
    console.error("getJenisDokumen error:", err.message);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
    });
  }
};

module.exports = {
  getAllArsip,
  getArsipById,
  createArsip,
  updateArsip,
  deleteArsip,
  downloadArsip,
  getJenisDokumen,
};
