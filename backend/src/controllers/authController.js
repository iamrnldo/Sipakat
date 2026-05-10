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
  const ipAddress = req.ip || req.connection.remoteAddress || "";

  let browser = "Unknown";
  let os = "Unknown";

  if (userAgent.includes("Firefox")) browser = "Firefox";
  else if (userAgent.includes("Chrome")) browser = "Chrome";
  else if (userAgent.includes("Safari")) browser = "Safari";
  else if (userAgent.includes("Edge")) browser = "Edge";

  if (userAgent.includes("Windows")) os = "Windows";
  else if (userAgent.includes("Mac")) os = "MacOS";
  else if (userAgent.includes("Linux")) os = "Linux";
  else if (userAgent.includes("Android")) os = "Android";
  else if (userAgent.includes("iOS")) os = "iOS";

  return { browser, os, ipAddress, device_info: userAgent };
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: "Username dan password wajib diisi",
    });
  }

  try {
    // Cari user berdasarkan username
    const result = await query(
      `SELECT id, nama_lengkap, username, email, password, jabatan, 
              hak_akses, status, foto, no_hp, alamat
       FROM users WHERE username = $1`,
      [username],
    );

    if (result.rows.length === 0) {
      // Log failed attempt
      const { ipAddress, browser, os, device_info } = getDeviceInfo(req);
      await query(
        `INSERT INTO login_history (user_id, ip_address, device_info, browser, os, status) 
         VALUES (NULL, $1, $2, $3, $4, 'failed')`,
        [ipAddress, device_info, browser, os],
      );

      return res.status(401).json({
        success: false,
        message: "Username atau password salah",
      });
    }

    const user = result.rows[0];

    if (user.status === "nonaktif") {
      return res.status(403).json({
        success: false,
        message: "Akun Anda telah dinonaktifkan. Hubungi administrator",
      });
    }

    // Cek password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      const { ipAddress, browser, os, device_info } = getDeviceInfo(req);
      await query(
        `INSERT INTO login_history (user_id, ip_address, device_info, browser, os, status) 
         VALUES ($1, $2, $3, $4, $5, 'failed')`,
        [user.id, ipAddress, device_info, browser, os],
      );

      return res.status(401).json({
        success: false,
        message: "Username atau password salah",
      });
    }

    // Update last login
    await query(
      "UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1",
      [user.id],
    );

    // Log successful login
    const { ipAddress, browser, os, device_info } = getDeviceInfo(req);
    await query(
      `INSERT INTO login_history (user_id, ip_address, device_info, browser, os, status) 
       VALUES ($1, $2, $3, $4, $5, 'success')`,
      [user.id, ipAddress, device_info, browser, os],
    );

    // Log activity
    await query(
      `INSERT INTO activity_log (user_id, aksi, modul, deskripsi, ip_address)
       VALUES ($1, 'LOGIN', 'AUTH', $2, $3)`,
      [user.id, `User ${user.username} berhasil login`, ipAddress],
    );

    // Generate token
    const token = generateToken(user.id);

    // Remove password from response
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
    console.error("Login error:", err);
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

    res.status(200).json({
      success: true,
      message: "Logout berhasil",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
    });
  }
};

// @desc    Get current user profile
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

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res) => {
  const { password_lama, password_baru, konfirmasi_password } = req.body;

  if (!password_lama || !password_baru || !konfirmasi_password) {
    return res.status(400).json({
      success: false,
      message: "Semua field wajib diisi",
    });
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
      return res.status(400).json({
        success: false,
        message: "Password lama tidak sesuai",
      });
    }

    const hashedPassword = await bcrypt.hash(password_baru, 10);

    await query("UPDATE users SET password = $1 WHERE id = $2", [
      hashedPassword,
      req.user.id,
    ]);

    await query(
      `INSERT INTO activity_log (user_id, aksi, modul, deskripsi, ip_address)
       VALUES ($1, 'UBAH_PASSWORD', 'AUTH', 'User mengubah password', $2)`,
      [req.user.id, req.ip],
    );

    res.status(200).json({
      success: true,
      message: "Password berhasil diubah",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
    });
  }
};

module.exports = { login, logout, getMe, changePassword };
