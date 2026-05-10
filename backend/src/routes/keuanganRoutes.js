const express = require("express");
const router = express.Router();
const {
  getAllKeuangan,
  getKeuanganById,
  createKeuangan,
  updateKeuangan,
  deleteKeuangan,
  downloadKeuangan,
  shareKeuangan,
} = require("../controllers/keuanganController");
const { protect, adminOrUser } = require("../middleware/authMiddleware");
const { uploadKeuangan } = require("../middleware/uploadMiddleware");

// IMPORTANT: specific sub-routes MUST be declared before /:id
// Otherwise Express matches "download" and "share" as the :id param

// @route   GET /api/keuangan
router.get("/", protect, getAllKeuangan);

// @route   POST /api/keuangan
router.post(
  "/",
  protect,
  adminOrUser,
  uploadKeuangan.single("file"),
  createKeuangan,
);

// @route   GET /api/keuangan/:id
router.get("/:id", protect, getKeuanganById);

// @route   GET /api/keuangan/:id/download
router.get("/:id/download", protect, downloadKeuangan);

// @route   GET /api/keuangan/:id/share
router.get("/:id/share", protect, shareKeuangan);

// @route   PUT /api/keuangan/:id
router.put(
  "/:id",
  protect,
  adminOrUser,
  uploadKeuangan.single("file"),
  updateKeuangan,
);

// @route   DELETE /api/keuangan/:id
router.delete("/:id", protect, adminOrUser, deleteKeuangan);

module.exports = router;
