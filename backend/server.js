require("dotenv").config();
const app = require("./src/app");
const { testConnection } = require("./src/config/database");

const PORT = process.env.PORT || 5000;

// Test database connection
testConnection();

app.listen(PORT, () => {
  console.log(`
  ╔════════════════════════════════════════╗
  ║     SIPAKAT Backend Server Running     ║
  ║     Port: ${PORT}                          ║
  ║     Mode: ${process.env.NODE_ENV}             ║
  ╚════════════════════════════════════════╝
  `);
});
