const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");
const rateLimit = require("express-rate-limit");

// Import Routes
const authRoutes = require("./routes/authRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const arsipRoutes = require("./routes/arsipRoutes");
const kepegawaianRoutes = require("./routes/kepegawaianRoutes");
const keuanganRoutes = require("./routes/keuanganRoutes");
const profilRoutes = require("./routes/profilRoutes");

// Import Middleware
const { errorHandler, notFound } = require("./middleware/errorMiddleware");

const app = express();

// Security Headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);

// CORS Configuration
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? process.env.FRONTEND_URL
        : "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: {
    success: false,
    message: "Terlalu banyak permintaan, coba lagi nanti",
  },
});
app.use("/api/", limiter);

// Body Parser
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Logger
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Static Files (uploads)
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Health Check
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "SIPAKAT API is running",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/arsip", arsipRoutes);
app.use("/api/kepegawaian", kepegawaianRoutes);
app.use("/api/keuangan", keuanganRoutes);
app.use("/api/profil", profilRoutes);

// Error Handlers
app.use(notFound);
app.use(errorHandler);

module.exports = app;
