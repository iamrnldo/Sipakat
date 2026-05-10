const { query } = require("../config/database");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const path = require("path");

// @desc    Get profil pengguna
// @route   GET /api/profil
// @access  Private
const getProfil = async (req, res) => {
  try {
    const result = await query(
      `SELECT id, nama_lengkap, username, email, jabatan, status, 
              no_hp, alamat, foto, hak_akses, catatan, last_login, created_at, updated_at
       FROM users WHERE id = $1`,
      [req.user.id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User tidak ditemukan",
      });
    }

    res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (err) {
    console.error("getProfil error:", err.message);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
    });
  }
};

// @desc    Update profil pengguna
// @route   PUT /api/profil
// @access  Private
const updateProfil = async (req, res) => {
  const { nama_lengkap, email, jabatan, no_hp, alamat, catatan } = req.body;

  try {
    const existing = await query("SELECT * FROM users WHERE id = $1", [
      req.user.id,
    ]);

    if (existing.rows.length === 0) {
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(404).json({
        success: false,
        message: "User tidak ditemukan",
      });
    }

    // Cek email duplikat
    if (email && email !== existing.rows[0].email) {
      const emailCheck = await query(
        "SELECT id FROM users WHERE email = $1 AND id != $2",
        [email, req.user.id],
      );
      if (emailCheck.rows.length > 0) {
        if (req.file && fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
        return res.status(400).json({
          success: false,
          message: "Email sudah digunakan",
        });
      }
    }

    let fotoPath = existing.rows[0].foto;

    if (req.file) {
      // Hapus foto lama jika ada
      if (existing.rows[0].foto) {
        const oldPath = path.join(__dirname, "../../", existing.rows[0].foto);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      fotoPath = `/uploads/photos/${req.file.filename}`;
    }

    const result = await query(
      `UPDATE users 
       SET nama_lengkap = $1, email = $2, jabatan = $3, no_hp = $4, 
           alamat = $5, catatan = $6, foto = $7, updated_at = NOW()
       WHERE id = $8
       RETURNING id, nama_lengkap, username, email, jabatan, status, 
                 no_hp, alamat, foto, hak_akses, catatan, last_login, created_at, updated_at`,
      [
        nama_lengkap || existing.rows[0].nama_lengkap,
        email || existing.rows[0].email,
        jabatan !== undefined ? jabatan : existing.rows[0].jabatan,
        no_hp !== undefined ? no_hp : existing.rows[0].no_hp,
        alamat !== undefined ? alamat : existing.rows[0].alamat,
        catatan !== undefined ? catatan : existing.rows[0].catatan,
        fotoPath,
        req.user.id,
      ],
    );

    await query(
      `INSERT INTO activity_log (user_id, aksi, modul, deskripsi, ip_address)
       VALUES ($1, 'EDIT_PROFIL', 'PROFIL', 'Mengubah profil', $2)`,
      [req.user.id, req.ip],
    );

    res.status(200).json({
      success: true,
      message: "Profil berhasil diperbarui",
      data: result.rows[0],
    });
  } catch (err) {
    console.error("updateProfil error:", err.message);
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
    });
  }
};

// @desc    Get riwayat aktivitas
// @route   GET /api/profil/aktivitas
// @access  Private
const getRiwayatAktivitas = async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  try {
    const countResult = await query(
      "SELECT COUNT(*) FROM activity_log WHERE user_id = $1",
      [req.user.id],
    );

    const result = await query(
      `SELECT aksi, modul, deskripsi, ip_address, created_at
       FROM activity_log
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [req.user.id, parseInt(limit), offset],
    );

    const total = parseInt(countResult.rows[0].count);

    res.status(200).json({
      success: true,
      data: result.rows,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        total_pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    console.error("getRiwayatAktivitas error:", err.message);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
    });
  }
};

// @desc    Get perangkat login
// @route   GET /api/profil/perangkat
// @access  Private
const getPerangkatLogin = async (req, res) => {
  try {
    const result = await query(
      `SELECT id, ip_address, browser, os, device_info, status, created_at
       FROM login_history
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 10`,
      [req.user.id],
    );

    res.status(200).json({
      success: true,
      data: result.rows,
    });
  } catch (err) {
    console.error("getPerangkatLogin error:", err.message);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
    });
  }
};

// @desc    Get all users (admin only)
// @route   GET /api/profil/users
// @access  Private (admin)
const getAllUsers = async (req, res) => {
  const { page = 1, limit = 10, search = "" } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  try {
    const params = [];
    let whereClause = "WHERE 1=1";
    let paramCount = 1;

    if (search) {
      whereClause += ` AND (nama_lengkap ILIKE $${paramCount} OR username ILIKE $${paramCount} OR email ILIKE $${paramCount})`;
      params.push(`%${search}%`);
      paramCount++;
    }

    const countResult = await query(
      `SELECT COUNT(*) FROM users ${whereClause}`,
      params,
    );

    const result = await query(
      `SELECT id, nama_lengkap, username, email, jabatan, status, hak_akses, foto, last_login, created_at
       FROM users ${whereClause}
       ORDER BY created_at DESC
       LIMIT $${paramCount} OFFSET $${paramCount + 1}`,
      [...params, parseInt(limit), offset],
    );

    const total = parseInt(countResult.rows[0].count);

    res.status(200).json({
      success: true,
      data: result.rows,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        total_pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    console.error("getAllUsers error:", err.message);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
    });
  }
};

// @desc    Create user (admin only)
// @route   POST /api/profil/users
// @access  Private (admin)
const createUser = async (req, res) => {
  const {
    nama_lengkap,
    username,
    email,
    password,
    jabatan,
    hak_akses,
    no_hp,
    alamat,
  } = req.body;

  if (!nama_lengkap || !username || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "Nama lengkap, username, email, dan password wajib diisi",
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      message: "Password minimal 6 karakter",
    });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await query(
      `INSERT INTO users (nama_lengkap, username, email, password, jabatan, hak_akses, no_hp, alamat)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, nama_lengkap, username, email, jabatan, hak_akses, status, created_at`,
      [
        nama_lengkap,
        username,
        email,
        hashedPassword,
        jabatan || null,
        hak_akses || "user",
        no_hp || null,
        alamat || null,
      ],
    );

    await query(
      `INSERT INTO activity_log (user_id, aksi, modul, deskripsi, ip_address)
       VALUES ($1, 'TAMBAH_USER', 'PROFIL', $2, $3)`,
      [req.user.id, `Admin menambah user: ${username}`, req.ip],
    );

    res.status(201).json({
      success: true,
      message: "User berhasil dibuat",
      data: result.rows[0],
    });
  } catch (err) {
    console.error("createUser error:", err.message);
    if (err.code === "23505") {
      return res.status(400).json({
        success: false,
        message: "Username atau email sudah digunakan",
      });
    }
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
    });
  }
};

// @desc    Update user status/hak_akses (admin only)
// @route   PATCH /api/profil/users/:id
// @access  Private (admin)
const updateUserAdmin = async (req, res) => {
  const { status, hak_akses, jabatan } = req.body;

  // Cegah admin mengubah dirinya sendiri via endpoint ini
  if (parseInt(req.params.id) === req.user.id) {
    return res.status(403).json({
      success: false,
      message: "Tidak dapat mengubah data akun sendiri melalui endpoint ini",
    });
  }

  try {
    const checkResult = await query("SELECT * FROM users WHERE id = $1", [
      req.params.id,
    ]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User tidak ditemukan",
      });
    }

    const existing = checkResult.rows[0];

    const result = await query(
      `UPDATE users 
       SET status = $1, hak_akses = $2, jabatan = $3, updated_at = NOW()
       WHERE id = $4
       RETURNING id, nama_lengkap, username, email, jabatan, hak_akses, status, updated_at`,
      [
        status || existing.status,
        hak_akses || existing.hak_akses,
        jabatan !== undefined ? jabatan : existing.jabatan,
        req.params.id,
      ],
    );

    await query(
      `INSERT INTO activity_log (user_id, aksi, modul, deskripsi, ip_address)
       VALUES ($1, 'EDIT_USER', 'PROFIL', $2, $3)`,
      [
        req.user.id,
        `Admin mengubah user: ${existing.username} (ID: ${req.params.id})`,
        req.ip,
      ],
    );

    res.status(200).json({
      success: true,
      message: "User berhasil diperbarui",
      data: result.rows[0],
    });
  } catch (err) {
    console.error("updateUserAdmin error:", err.message);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
    });
  }
};

// @desc    Delete user (admin only)
// @route   DELETE /api/profil/users/:id
// @access  Private (admin)
const deleteUser = async (req, res) => {
  // Cegah admin menghapus dirinya sendiri
  if (parseInt(req.params.id) === req.user.id) {
    return res.status(403).json({
      success: false,
      message: "Tidak dapat menghapus akun sendiri",
    });
  }

  try {
    const checkResult = await query("SELECT * FROM users WHERE id = $1", [
      req.params.id,
    ]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User tidak ditemukan",
      });
    }

    const existing = checkResult.rows[0];

    // Hapus foto jika ada
    if (existing.foto) {
      const fotoPath = path.join(__dirname, "../../", existing.foto);
      if (fs.existsSync(fotoPath)) fs.unlinkSync(fotoPath);
    }

    await query("DELETE FROM users WHERE id = $1", [req.params.id]);

    await query(
      `INSERT INTO activity_log (user_id, aksi, modul, deskripsi, ip_address)
       VALUES ($1, 'HAPUS_USER', 'PROFIL', $2, $3)`,
      [
        req.user.id,
        `Admin menghapus user: ${existing.username} (ID: ${req.params.id})`,
        req.ip,
      ],
    );

    res.status(200).json({
      success: true,
      message: "User berhasil dihapus",
    });
  } catch (err) {
    console.error("deleteUser error:", err.message);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
    });
  }
};

module.exports = {
  getProfil,
  updateProfil,
  getRiwayatAktivitas,
  getPerangkatLogin,
  getAllUsers,
  createUser,
  updateUserAdmin,
  deleteUser,
};
