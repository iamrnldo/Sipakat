const { query } = require("../config/database");
const fs = require("fs");
const path = require("path");

// @desc    Get all aparatur
// @route   GET /api/kepegawaian
// @access  Private
const getAllAparatur = async (req, res) => {
  const {
    page = 1,
    limit = 10,
    search = "",
    jabatan = "",
    status = "",
    sort = "nama",
    order = "ASC",
  } = req.query;

  const offset = (parseInt(page) - 1) * parseInt(limit);
  const allowedSort = ["nama", "jabatan", "nip", "status", "created_at"];
  const sortField = allowedSort.includes(sort) ? sort : "nama";
  const sortOrder = order.toUpperCase() === "DESC" ? "DESC" : "ASC";

  try {
    let whereClause = "WHERE 1=1";
    const params = [];
    let paramCount = 1;

    if (search) {
      whereClause += ` AND (nama ILIKE $${paramCount} OR nip ILIKE $${paramCount} OR jabatan ILIKE $${paramCount})`;
      params.push(`%${search}%`);
      paramCount++;
    }

    if (jabatan) {
      whereClause += ` AND jabatan = $${paramCount}`;
      params.push(jabatan);
      paramCount++;
    }

    if (status) {
      whereClause += ` AND status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    const countResult = await query(
      `SELECT COUNT(*) FROM kepegawaian_aparatur ${whereClause}`,
      params,
    );

    const dataResult = await query(
      `SELECT ka.*, u.nama_lengkap as nama_pembuat
       FROM kepegawaian_aparatur ka
       LEFT JOIN users u ON ka.dibuat_oleh = u.id
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

// @desc    Get aparatur by ID
// @route   GET /api/kepegawaian/:id
// @access  Private
const getAparaturById = async (req, res) => {
  try {
    const result = await query(
      `SELECT ka.*, u.nama_lengkap as nama_pembuat
       FROM kepegawaian_aparatur ka
       LEFT JOIN users u ON ka.dibuat_oleh = u.id
       WHERE ka.id = $1`,
      [req.params.id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Data aparatur tidak ditemukan",
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

// @desc    Create aparatur
// @route   POST /api/kepegawaian
// @access  Private (admin)
const createAparatur = async (req, res) => {
  const {
    nama,
    nip,
    jabatan,
    status = "aktif",
    no_hp,
    email,
    alamat,
    tanggal_lahir,
    tanggal_bergabung,
    pendidikan,
    golongan,
    keterangan,
  } = req.body;

  if (!nama || !jabatan) {
    if (req.file) fs.unlinkSync(req.file.path);
    return res.status(400).json({
      success: false,
      message: "Nama dan jabatan wajib diisi",
    });
  }

  try {
    let fotoPath = null;
    if (req.file) {
      fotoPath = `/uploads/photos/${req.file.filename}`;
    }

    const result = await query(
      `INSERT INTO kepegawaian_aparatur 
       (nama, nip, jabatan, foto, status, no_hp, email, alamat, tanggal_lahir, 
        tanggal_bergabung, pendidikan, golongan, keterangan, dibuat_oleh)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
       RETURNING *`,
      [
        nama,
        nip,
        jabatan,
        fotoPath,
        status,
        no_hp,
        email,
        alamat,
        tanggal_lahir || null,
        tanggal_bergabung || null,
        pendidikan,
        golongan,
        keterangan,
        req.user.id,
      ],
    );

    await query(
      `INSERT INTO activity_log (user_id, aksi, modul, deskripsi, ip_address)
       VALUES ($1, 'TAMBAH', 'KEPEGAWAIAN', $2, $3)`,
      [req.user.id, `Menambah aparatur: ${nama}`, req.ip],
    );

    res.status(201).json({
      success: true,
      message: "Data aparatur berhasil ditambahkan",
      data: result.rows[0],
    });
  } catch (err) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    if (err.code === "23505") {
      return res.status(400).json({
        success: false,
        message: "NIP sudah terdaftar",
      });
    }
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
    });
  }
};

// @desc    Update aparatur
// @route   PUT /api/kepegawaian/:id
// @access  Private (admin)
const updateAparatur = async (req, res) => {
  const {
    nama,
    nip,
    jabatan,
    status,
    no_hp,
    email,
    alamat,
    tanggal_lahir,
    tanggal_bergabung,
    pendidikan,
    golongan,
    keterangan,
  } = req.body;

  try {
    const checkResult = await query(
      "SELECT * FROM kepegawaian_aparatur WHERE id = $1",
      [req.params.id],
    );

    if (checkResult.rows.length === 0) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(404).json({
        success: false,
        message: "Data aparatur tidak ditemukan",
      });
    }

    const existing = checkResult.rows[0];
    let fotoPath = existing.foto;

    if (req.file) {
      if (existing.foto) {
        const oldPath = path.join(__dirname, "../../", existing.foto);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      fotoPath = `/uploads/photos/${req.file.filename}`;
    }

    const result = await query(
      `UPDATE kepegawaian_aparatur 
       SET nama = $1, nip = $2, jabatan = $3, foto = $4, status = $5,
           no_hp = $6, email = $7, alamat = $8, tanggal_lahir = $9,
           tanggal_bergabung = $10, pendidikan = $11, golongan = $12, keterangan = $13
       WHERE id = $14
       RETURNING *`,
      [
        nama || existing.nama,
        nip !== undefined ? nip : existing.nip,
        jabatan || existing.jabatan,
        fotoPath,
        status || existing.status,
        no_hp !== undefined ? no_hp : existing.no_hp,
        email !== undefined ? email : existing.email,
        alamat !== undefined ? alamat : existing.alamat,
        tanggal_lahir || existing.tanggal_lahir,
        tanggal_bergabung || existing.tanggal_bergabung,
        pendidikan !== undefined ? pendidikan : existing.pendidikan,
        golongan !== undefined ? golongan : existing.golongan,
        keterangan !== undefined ? keterangan : existing.keterangan,
        req.params.id,
      ],
    );

    await query(
      `INSERT INTO activity_log (user_id, aksi, modul, deskripsi, ip_address)
       VALUES ($1, 'EDIT', 'KEPEGAWAIAN', $2, $3)`,
      [req.user.id, `Mengubah data aparatur: ${result.rows[0].nama}`, req.ip],
    );

    res.status(200).json({
      success: true,
      message: "Data aparatur berhasil diperbarui",
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

// @desc    Delete aparatur
// @route   DELETE /api/kepegawaian/:id
// @access  Private (admin)
const deleteAparatur = async (req, res) => {
  try {
    const result = await query(
      "SELECT * FROM kepegawaian_aparatur WHERE id = $1",
      [req.params.id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Data aparatur tidak ditemukan",
      });
    }

    // Hapus foto jika ada
    if (result.rows[0].foto) {
      const fotoPath = path.join(__dirname, "../../", result.rows[0].foto);
      if (fs.existsSync(fotoPath)) fs.unlinkSync(fotoPath);
    }

    await query("DELETE FROM kepegawaian_aparatur WHERE id = $1", [
      req.params.id,
    ]);

    await query(
      `INSERT INTO activity_log (user_id, aksi, modul, deskripsi, ip_address)
       VALUES ($1, 'HAPUS', 'KEPEGAWAIAN', $2, $3)`,
      [req.user.id, `Menghapus aparatur: ${result.rows[0].nama}`, req.ip],
    );

    res.status(200).json({
      success: true,
      message: "Data aparatur berhasil dihapus",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
    });
  }
};

module.exports = {
  getAllAparatur,
  getAparaturById,
  createAparatur,
  updateAparatur,
  deleteAparatur,
};
