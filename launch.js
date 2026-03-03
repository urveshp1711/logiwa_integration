import app from "./src/app.js";

// Start the server
const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`[DEBUG] Shipping API running on http://localhost:${PORT}/`);
  console.log(`[DEBUG] Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`[DEBUG] Debugger port: 9229`);
});

// Graceful shutdown handler
process.on("SIGINT", () => {
  console.log("\n[DEBUG] Shutting down gracefully...");
  server.close(() => {
    console.log("[DEBUG] Server closed");
    process.exit(0);
  });
});

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  console.error("[DEBUG] Uncaught Exception:", error);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("[DEBUG] Unhandled Rejection at:", promise, "reason:", reason);
});
