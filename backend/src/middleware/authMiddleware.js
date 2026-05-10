const jwt = require("jsonwebtoken");
const { query } = require("../config/database");

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Akses ditolak. Token tidak ditemukan",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const result = await query(
      "SELECT id, nama_lengkap, username, email, jabatan, hak_akses, status, foto FROM users WHERE id = $1",
      [decoded.id],
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Token tidak valid. User tidak ditemukan",
      });
    }

    if (result.rows[0].status === "nonaktif") {
      return res.status(403).json({
        success: false,
        message: "Akun Anda telah dinonaktifkan",
      });
    }

    req.user = result.rows[0];
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token telah kadaluarsa. Silakan login kembali",
      });
    }
    return res.status(401).json({
      success: false,
      message: "Token tidak valid",
    });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user && req.user.hak_akses === "admin") {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: "Akses ditolak. Hanya admin yang diizinkan",
    });
  }
};

const adminOrUser = (req, res, next) => {
  if (
    req.user &&
    (req.user.hak_akses === "admin" || req.user.hak_akses === "user")
  ) {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: "Akses ditolak. Hak akses tidak mencukupi",
    });
  }
};

// Log activity helper
const logActivity = async (userId, aksi, modul, deskripsi, ipAddress) => {
  try {
    await query(
      "INSERT INTO activity_log (user_id, aksi, modul, deskripsi, ip_address) VALUES ($1, $2, $3, $4, $5)",
      [userId, aksi, modul, deskripsi, ipAddress],
    );
  } catch (err) {
    console.error("Log activity error:", err.message);
  }
};

module.exports = { protect, adminOnly, adminOrUser, logActivity };
