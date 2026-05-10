const express = require("express");
const router = express.Router();
const {
  getProfil,
  updateProfil,
  getRiwayatAktivitas,
  getPerangkatLogin,
  getAllUsers,
  createUser,
  updateUserAdmin,
  deleteUser,
} = require("../controllers/profilController");
const { protect, adminOnly } = require("../middleware/authMiddleware");
const { uploadPhoto } = require("../middleware/uploadMiddleware");

// @route   GET /api/profil
router.get("/", protect, getProfil);

// @route   PUT /api/profil
router.put("/", protect, uploadPhoto.single("foto"), updateProfil);

// @route   GET /api/profil/aktivitas
router.get("/aktivitas", protect, getRiwayatAktivitas);

// @route   GET /api/profil/perangkat
router.get("/perangkat", protect, getPerangkatLogin);

// ============= Admin Routes =============

// @route   GET /api/profil/users
router.get("/users", protect, adminOnly, getAllUsers);

// @route   POST /api/profil/users
router.post("/users", protect, adminOnly, createUser);

// @route   PATCH /api/profil/users/:id
router.patch("/users/:id", protect, adminOnly, updateUserAdmin);

// @route   DELETE /api/profil/users/:id
router.delete("/users/:id", protect, adminOnly, deleteUser);

module.exports = router;
