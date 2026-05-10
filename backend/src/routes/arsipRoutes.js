const express = require("express");
const router = express.Router();
const {
  getAllArsip,
  getArsipById,
  createArsip,
  updateArsip,
  deleteArsip,
  downloadArsip,
  getJenisDokumen,
} = require("../controllers/arsipController");
const { protect, adminOrUser } = require("../middleware/authMiddleware");
const { uploadDocument } = require("../middleware/uploadMiddleware");

// @route   GET /api/arsip/jenis
router.get("/jenis", protect, getJenisDokumen);

// @route   GET /api/arsip
router.get("/", protect, getAllArsip);

// @route   GET /api/arsip/:id
router.get("/:id", protect, getArsipById);

// @route   GET /api/arsip/:id/download
router.get("/:id/download", protect, downloadArsip);

// @route   POST /api/arsip
router.post(
  "/",
  protect,
  adminOrUser,
  uploadDocument.single("file"),
  createArsip,
);

// @route   PUT /api/arsip/:id
router.put(
  "/:id",
  protect,
  adminOrUser,
  uploadDocument.single("file"),
  updateArsip,
);

// @route   DELETE /api/arsip/:id
router.delete("/:id", protect, adminOrUser, deleteArsip);

module.exports = router;
