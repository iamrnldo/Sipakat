const notFound = (req, res, next) => {
  const error = new Error(`Route tidak ditemukan: ${req.originalUrl}`);
  res.status(404);
  next(error);
};

const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message;

  // PostgreSQL errors
  if (err.code === "23505") {
    statusCode = 400;
    message = "Data sudah ada (duplikat)";
  }

  if (err.code === "23503") {
    statusCode = 400;
    message = "Referensi data tidak valid";
  }

  if (err.code === "22P02") {
    statusCode = 400;
    message = "Format UUID tidak valid";
  }

  // Multer errors
  if (err.code === "LIMIT_FILE_SIZE") {
    statusCode = 400;
    message = "Ukuran file terlalu besar";
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

module.exports = { notFound, errorHandler };
