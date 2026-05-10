const express = require("express");
const router = express.Router();
const {
  getAllAparatur,
  getAparaturById,
  createAparatur,
  updateAparatur,
  deleteAparatur,
} = require("../controllers/kepegawaianController");
const {
  protect,
  adminOnly,
  adminOrUser,
} = require("../middleware/authMiddleware");
const { uploadPhoto } = require("../middleware/uploadMiddleware");

// @route   GET /api/kepegawaian
router.get("/", protect, getAllAparatur);

// @route   GET /api/kepegawaian/:id
router.get("/:id", protect, getAparaturById);

// @route   POST /api/kepegawaian
router.post(
  "/",
  protect,
  adminOrUser,
  uploadPhoto.single("foto"),
  createAparatur,
);

// @route   PUT /api/kepegawaian/:id
router.put(
  "/:id",
  protect,
  adminOrUser,
  uploadPhoto.single("foto"),
  updateAparatur,
);

// @route   DELETE /api/kepegawaian/:id
router.delete("/:id", protect, adminOnly, deleteAparatur);

module.exports = router;
