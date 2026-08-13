const dns = require("dns");

dns.setServers([
  "8.8.8.8",
  "8.8.4.4",
]);

require("dotenv").config();

const http = require("http");

const app = require("./app");
const connectDB = require("./config/db");

// ========================================
// PORT
// ========================================

const PORT = process.env.PORT || 5000;

// ========================================
// START SERVER
// ========================================

const startServer = async () => {
  try {
    // Connect MongoDB first
    await connectDB();

    console.log("✅ Database connection ready.");

    // Create HTTP server
    const server = http.createServer(app);

    // Server error handler
    server.on("error", (error) => {
      console.error("❌ Server Error:");

      if (error.code === "EADDRINUSE") {
        console.error(
          `Port ${PORT} is already in use.`
        );
      } else {
        console.error(error);
      }
    });

    // Start listening
    server.listen(PORT, "0.0.0.0", () => {
      console.log("");
      console.log(
        "========================================="
      );
      console.log(
        "🚀 Work Up Home Server Started"
      );
      console.log(
        "========================================="
      );
      console.log(
        `🌐 Local: http://localhost:${PORT}`
      );
      console.log(
        `📡 Port : ${PORT}`
      );
      console.log(
        "========================================="
      );
      console.log("");
      console.log(
        "Server is running. Keep this terminal open."
      );
      console.log("");
    });

  } catch (error) {
    console.error("");
    console.error(
      "❌ Server Startup Failed"
    );
    console.error("");
    console.error(error);
    console.error("");

    process.exit(1);
  }
};

// ========================================
// PROCESS ERRORS
// ========================================

process.on(
  "uncaughtException",
  (error) => {
    console.error(
      "❌ Uncaught Exception:"
    );
    console.error(error);
  }
);

process.on(
  "unhandledRejection",
  (error) => {
    console.error(
      "❌ Unhandled Promise Rejection:"
    );
    console.error(error);
  }
);

// ========================================
// START
// ========================================

startServer();