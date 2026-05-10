const jwt = require("jsonwebtoken");
const { query } = require("../config/database");

// @desc  Verify JWT token and attach user to req
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Akses ditolak. Token tidak tersedia",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const result = await query(
      "SELECT id, nama_lengkap, username, email, hak_akses, status FROM users WHERE id = $1",
      [decoded.id],
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "User tidak ditemukan",
      });
    }

    const user = result.rows[0];

    if (user.status !== "aktif") {
      return res.status(403).json({
        success: false,
        message: "Akun Anda telah dinonaktifkan",
      });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("Auth middleware error:", err.message);
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token telah kadaluarsa, silakan login kembali",
      });
    }
    return res.status(401).json({
      success: false,
      message: "Token tidak valid",
    });
  }
};

// @desc  Allow only admin
const adminOnly = (req, res, next) => {
  if (req.user?.hak_akses !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Akses ditolak. Hanya admin yang diizinkan",
    });
  }
  next();
};

// @desc  Allow admin or user (block viewer)
const adminOrUser = (req, res, next) => {
  const allowed = ["admin", "user"];
  if (!allowed.includes(req.user?.hak_akses)) {
    return res.status(403).json({
      success: false,
      message: "Akses ditolak. Anda tidak memiliki izin untuk aksi ini",
    });
  }
  next();
};

module.exports = { protect, adminOnly, adminOrUser };
