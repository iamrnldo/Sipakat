const { query } = require("../config/database");
const fs = require("fs");
const path = require("path");

// @desc    Get all dokumen keuangan
// @route   GET /api/keuangan
// @access  Private
const getAllKeuangan = async (req, res) => {
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
  const allowedSort = [
    "nama_dokumen",
    "jenis_dokumen",
    "tahun",
    "tanggal",
    "nominal",
    "created_at",
  ];
  const sortField = allowedSort.includes(sort) ? sort : "created_at";
  const sortOrder = order.toUpperCase() === "ASC" ? "ASC" : "DESC";

  try {
    let whereClause = "WHERE status != 'hapus'";
    const params = [];
    let paramCount = 1;

    if (search) {
      whereClause += ` AND nama_dokumen ILIKE $${paramCount}`;
      params.push(`%${search}%`);
      paramCount++;
    }

    if (jenis) {
      whereClause += ` AND jenis_dokumen = $${paramCount}`;
      params.push(jenis);
      paramCount++;
    }

    if (tahun) {
      whereClause += ` AND tahun = $${paramCount}`;
      params.push(tahun);
      paramCount++;
    }

    const countResult = await query(
      `SELECT COUNT(*) FROM keuangan_desa ${whereClause}`,
      params,
    );

    const dataResult = await query(
      `SELECT kd.*, u.nama_lengkap as nama_pembuat
       FROM keuangan_desa kd
       LEFT JOIN users u ON kd.dibuat_oleh = u.id
       ${whereClause}
       ORDER BY ${sortField} ${sortOrder}
       LIMIT $${paramCount} OFFSET $${paramCount + 1}`,
      [...params, parseInt(limit), offset],
    );

    const total = parseInt(countResult.rows[0].count);

    res.status(200).json({
      success: true,
      data: dataResult.rows,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        total_pages: Math.ceil(total / parseInt(limit)),
        has_next: parseInt(page) < Math.ceil(total / parseInt(limit)),
        has_prev: parseInt(page) > 1,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
    });
  }
};

// @desc    Get keuangan by ID
// @route   GET /api/keuangan/:id
// @access  Private
const getKeuanganById = async (req, res) => {
  try {
    const result = await query(
      `SELECT kd.*, u.nama_lengkap as nama_pembuat
       FROM keuangan_desa kd
       LEFT JOIN users u ON kd.dibuat_oleh = u.id
       WHERE kd.id = $1 AND kd.status != 'hapus'`,
      [req.params.id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Dokumen keuangan tidak ditemukan",
      });
    }

    res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
    });
  }
};

// @desc    Create dokumen keuangan
// @route   POST /api/keuangan
// @access  Private
const createKeuangan = async (req, res) => {
  const { nama_dokumen, jenis_dokumen, tahun, tanggal, nominal, deskripsi } =
    req.body;

  if (!nama_dokumen || !jenis_dokumen || !tahun || !tanggal) {
    if (req.file) fs.unlinkSync(req.file.path);
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
      filePath = `/uploads/keuangan/${req.file.filename}`;
      fileName = req.file.originalname;
      fileSize = req.file.size;
      fileType = req.file.mimetype;
    }

    const result = await query(
      `INSERT INTO keuangan_desa 
       (nama_dokumen, jenis_dokumen, tahun, tanggal, nominal, deskripsi, 
        file_path, file_name, file_size, file_type, dibuat_oleh)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [
        nama_dokumen,
        jenis_dokumen,
        tahun,
        tanggal,
        nominal || null,
        deskripsi,
        filePath,
        fileName,
        fileSize,
        fileType,
        req.user.id,
      ],
    );

    await query(
      `INSERT INTO activity_log (user_id, aksi, modul, deskripsi, ip_address)
       VALUES ($1, 'TAMBAH', 'KEUANGAN', $2, $3)`,
      [req.user.id, `Menambah dokumen keuangan: ${nama_dokumen}`, req.ip],
    );

    res.status(201).json({
      success: true,
      message: "Dokumen keuangan berhasil ditambahkan",
      data: result.rows[0],
    });
  } catch (err) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
    });
  }
};

// @desc    Update dokumen keuangan
// @route   PUT /api/keuangan/:id
// @access  Private
const updateKeuangan = async (req, res) => {
  const {
    nama_dokumen,
    jenis_dokumen,
    tahun,
    tanggal,
    nominal,
    deskripsi,
    status,
  } = req.body;

  try {
    const checkResult = await query(
      "SELECT * FROM keuangan_desa WHERE id = $1 AND status != 'hapus'",
      [req.params.id],
    );

    if (checkResult.rows.length === 0) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(404).json({
        success: false,
        message: "Dokumen keuangan tidak ditemukan",
      });
    }

    const existing = checkResult.rows[0];
    let filePath = existing.file_path;
    let fileName = existing.file_name;
    let fileSize = existing.file_size;
    let fileType = existing.file_type;

    if (req.file) {
      if (existing.file_path) {
        const oldFilePath = path.join(__dirname, "../../", existing.file_path);
        if (fs.existsSync(oldFilePath)) fs.unlinkSync(oldFilePath);
      }
      filePath = `/uploads/keuangan/${req.file.filename}`;
      fileName = req.file.originalname;
      fileSize = req.file.size;
      fileType = req.file.mimetype;
    }

    const result = await query(
      `UPDATE keuangan_desa 
       SET nama_dokumen = $1, jenis_dokumen = $2, tahun = $3, tanggal = $4,
           nominal = $5, deskripsi = $6, file_path = $7, file_name = $8,
           file_size = $9, file_type = $10, status = $11
       WHERE id = $12
       RETURNING *`,
      [
        nama_dokumen || existing.nama_dokumen,
        jenis_dokumen || existing.jenis_dokumen,
        tahun || existing.tahun,
        tanggal || existing.tanggal,
        nominal !== undefined ? nominal : existing.nominal,
        deskripsi !== undefined ? deskripsi : existing.deskripsi,
        filePath,
        fileName,
        fileSize,
        fileType,
        status || existing.status,
        req.params.id,
      ],
    );

    await query(
      `INSERT INTO activity_log (user_id, aksi, modul, deskripsi, ip_address)
       VALUES ($1, 'EDIT', 'KEUANGAN', $2, $3)`,
      [
        req.user.id,
        `Mengubah dokumen keuangan: ${result.rows[0].nama_dokumen}`,
        req.ip,
      ],
    );

    res.status(200).json({
      success: true,
      message: "Dokumen keuangan berhasil diperbarui",
      data: result.rows[0],
    });
  } catch (err) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
    });
  }
};

// @desc    Delete dokumen keuangan (soft delete)
// @route   DELETE /api/keuangan/:id
// @access  Private
const deleteKeuangan = async (req, res) => {
  try {
    const result = await query(
      "SELECT * FROM keuangan_desa WHERE id = $1 AND status != 'hapus'",
      [req.params.id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Dokumen keuangan tidak ditemukan",
      });
    }

    await query("UPDATE keuangan_desa SET status = 'hapus' WHERE id = $1", [
      req.params.id,
    ]);

    await query(
      `INSERT INTO activity_log (user_id, aksi, modul, deskripsi, ip_address)
       VALUES ($1, 'HAPUS', 'KEUANGAN', $2, $3)`,
      [
        req.user.id,
        `Menghapus dokumen keuangan: ${result.rows[0].nama_dokumen}`,
        req.ip,
      ],
    );

    res.status(200).json({
      success: true,
      message: "Dokumen keuangan berhasil dihapus",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
    });
  }
};

// @desc    Download keuangan file
// @route   GET /api/keuangan/:id/download
// @access  Private
const downloadKeuangan = async (req, res) => {
  try {
    const result = await query(
      "SELECT * FROM keuangan_desa WHERE id = $1 AND status != 'hapus'",
      [req.params.id],
    );

    if (result.rows.length === 0 || !result.rows[0].file_path) {
      return res.status(404).json({
        success: false,
        message: "File tidak ditemukan",
      });
    }

    const keuangan = result.rows[0];
    const filePath = path.join(__dirname, "../../", keuangan.file_path);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: "File tidak ditemukan di server",
      });
    }

    await query(
      `INSERT INTO activity_log (user_id, aksi, modul, deskripsi, ip_address)
       VALUES ($1, 'DOWNLOAD', 'KEUANGAN', $2, $3)`,
      [req.user.id, `Download keuangan: ${keuangan.nama_dokumen}`, req.ip],
    );

    res.download(filePath, keuangan.file_name);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
    });
  }
};

// @desc    Share link keuangan
// @route   GET /api/keuangan/:id/share
// @access  Private
const shareKeuangan = async (req, res) => {
  try {
    const result = await query(
      "SELECT * FROM keuangan_desa WHERE id = $1 AND status != 'hapus'",
      [req.params.id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Dokumen tidak ditemukan",
      });
    }

    const keuangan = result.rows[0];
    const shareUrl = keuangan.file_path
      ? `${req.protocol}://${req.get("host")}${keuangan.file_path}`
      : null;

    res.status(200).json({
      success: true,
      data: {
        id: keuangan.id,
        nama_dokumen: keuangan.nama_dokumen,
        share_url: shareUrl,
        file_name: keuangan.file_name,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
    });
  }
};

module.exports = {
  getAllKeuangan,
  getKeuanganById,
  createKeuangan,
  updateKeuangan,
  deleteKeuangan,
  downloadKeuangan,
  shareKeuangan,
};
