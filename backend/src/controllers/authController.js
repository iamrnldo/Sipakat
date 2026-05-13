const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { query } = require("../config/database");

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

// Get device info from request
const getDeviceInfo = (req) => {
  const userAgent = req.headers["user-agent"] || "";
  const ipAddress = req.ip || req.connection?.remoteAddress || "";

  let browser = "Unknown";
  let os = "Unknown";

  if (userAgent.includes("Firefox")) browser = "Firefox";
  else if (userAgent.includes("Edg")) browser = "Edge";
  else if (userAgent.includes("Chrome")) browser = "Chrome";
  else if (userAgent.includes("Safari")) browser = "Safari";

  if (userAgent.includes("Windows")) os = "Windows";
  else if (userAgent.includes("Android")) os = "Android";
  else if (userAgent.includes("iPhone") || userAgent.includes("iPad"))
    os = "iOS";
  else if (userAgent.includes("Mac")) os = "MacOS";
  else if (userAgent.includes("Linux")) os = "Linux";

  return { browser, os, ipAddress, device_info: userAgent };
};

// Log a login attempt (success or failed)
const logLoginAttempt = async (userId, deviceInfo, status) => {
  const { ipAddress, browser, os, device_info } = deviceInfo;
  await query(
    `INSERT INTO login_history (user_id, ip_address, device_info, browser, os, status)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [userId || null, ipAddress, device_info, browser, os, status],
  );
};

// @desc    Login user — accepts username OR email
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: "Username/email dan password wajib diisi",
    });
  }

  // ✅ FIX 1: Normalisasi identifier sekali di awal, konsisten untuk username & email
  const identifier = username.trim().toLowerCase();
  const isEmail = identifier.includes("@");
  const deviceInfo = getDeviceInfo(req);

  try {
    const result = await query(
      `SELECT id, nama_lengkap, username, email, password, jabatan,
              hak_akses, status, foto, no_hp, alamat
       FROM users
       WHERE ${isEmail ? "email" : "username"} = $1`,
      [identifier],
    );

    if (result.rows.length === 0) {
      await logLoginAttempt(null, deviceInfo, "failed");
      return res.status(401).json({
        success: false,
        message: "Username/email atau password salah",
      });
    }

    const user = result.rows[0];

    // ✅ FIX 2: Log attempt untuk akun nonaktif sebelum return
    if (user.status === "nonaktif") {
      await logLoginAttempt(user.id, deviceInfo, "failed");
      return res.status(403).json({
        success: false,
        message: "Akun Anda telah dinonaktifkan. Hubungi administrator",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      await logLoginAttempt(user.id, deviceInfo, "failed");
      return res.status(401).json({
        success: false,
        message: "Username/email atau password salah",
      });
    }

    // Update last_login
    await query(
      "UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1",
      [user.id],
    );

    // Log success
    await logLoginAttempt(user.id, deviceInfo, "success");
    await query(
      `INSERT INTO activity_log (user_id, aksi, modul, deskripsi, ip_address)
       VALUES ($1, 'LOGIN', 'AUTH', $2, $3)`,
      [user.id, `User ${user.username} berhasil login`, deviceInfo.ipAddress],
    );

    const token = generateToken(user.id);
    const { password: _, ...userWithoutPassword } = user;

    res.status(200).json({
      success: true,
      message: "Login berhasil",
      data: {
        token,
        user: userWithoutPassword,
      },
    });
  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
    });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logout = async (req, res) => {
  try {
    const { ipAddress } = getDeviceInfo(req);
    await query(
      `INSERT INTO activity_log (user_id, aksi, modul, deskripsi, ip_address)
       VALUES ($1, 'LOGOUT', 'AUTH', $2, $3)`,
      [req.user.id, `User ${req.user.username} logout`, ipAddress],
    );
    res.status(200).json({ success: true, message: "Logout berhasil" });
  } catch (err) {
    console.error("Logout error:", err.message);
    res
      .status(500)
      .json({ success: false, message: "Terjadi kesalahan server" });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const result = await query(
      `SELECT id, nama_lengkap, username, email, jabatan, status,
              no_hp, alamat, foto, hak_akses, catatan, last_login, created_at
       FROM users WHERE id = $1`,
      [req.user.id],
    );
    res.status(200).json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error("getMe error:", err.message);
    res
      .status(500)
      .json({ success: false, message: "Terjadi kesalahan server" });
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res) => {
  const { password_lama, password_baru, konfirmasi_password } = req.body;

  if (!password_lama || !password_baru || !konfirmasi_password) {
    return res
      .status(400)
      .json({ success: false, message: "Semua field wajib diisi" });
  }
  if (password_baru !== konfirmasi_password) {
    return res.status(400).json({
      success: false,
      message: "Password baru dan konfirmasi password tidak cocok",
    });
  }
  if (password_baru.length < 6) {
    return res.status(400).json({
      success: false,
      message: "Password baru minimal 6 karakter",
    });
  }

  try {
    const result = await query("SELECT password FROM users WHERE id = $1", [
      req.user.id,
    ]);
    const isMatch = await bcrypt.compare(
      password_lama,
      result.rows[0].password,
    );

    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Password lama tidak sesuai" });
    }

    const hashedPassword = await bcrypt.hash(password_baru, 10);
    await query(
      "UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2",
      [hashedPassword, req.user.id],
    );

    await query(
      `INSERT INTO activity_log (user_id, aksi, modul, deskripsi, ip_address)
       VALUES ($1, 'UBAH_PASSWORD', 'AUTH', 'User mengubah password', $2)`,
      [req.user.id, req.ip],
    );

    res
      .status(200)
      .json({ success: true, message: "Password berhasil diubah" });
  } catch (err) {
    console.error("changePassword error:", err.message);
    res
      .status(500)
      .json({ success: false, message: "Terjadi kesalahan server" });
  }
};

module.exports = { login, logout, getMe, changePassword };
