require("dotenv").config();

const http = require("http");
const app = require("./app");
const logger = require("./utils/logger");

const { connectRabbitMQ } = require("./config/rabbitmq");
const { connectRedis } = require("./config/redis");
const { initWebSocket } = require("./config/websocket");
const { startHeartbeat } = require("./websocket/socketHandler");
const {
  startTelemetryWorker,
  stopTelemetryWorker,
} = require("./queues/worker");
const { startAuditConsumer } = require("./modules/audit/audit.consumer");

const { initSocketIO } = require("./websocket/socketio");
const PORT = process.env.PORT || 3000;

async function bootstrap() {
  // 1️⃣ Connect Database
  require("./config/database");

  // 2️⃣ Connect RabbitMQ (blocks until connected)
  await connectRabbitMQ();

  // 3️⃣ Start consumer worker: queue → MongoDB
  await startTelemetryWorker();

  await startAuditConsumer();

  // 4️⃣ Connect Redis (optional, for caching or pub/sub)
  await connectRedis();

  // 5️⃣ Create HTTP server
  const server = http.createServer(app);

  // 6️⃣ Initialize WebSocket server
  const wss = initWebSocket(server);

  const io = initSocketIO(server);

  require("./modules/cron/cron.service");
  // 7️⃣ Heartbeat to detect and clean dead WS connections
  startHeartbeat(wss);

  //   Start listening
  server.listen(PORT, () => {
    logger.info(`HTTP server  → http://localhost:${PORT}`);
    logger.info(`WS   server  → ws://localhost:${PORT}/ws/telemetry`);
    logger.info(`socket.IO server  → http://localhost:${PORT}`);
  });

  process.on("unhandledRejection", (err) => {
    logger.error(`Unhandled Rejection: ${err.message}`);
    server.close(() => process.exit(1));
  });

  process.on("uncaughtException", (err) => {
    logger.error(`Uncaught Exception: ${err.message}`);
    process.exit(1);
  });

  // Graceful shutdown
  process.on("SIGTERM", async () => {
    logger.info("SIGTERM received — shutting down gracefully...");
    await stopTelemetryWorker();
    server.close(() => {
      logger.info("Server closed");
      process.exit(0);
    });
  });
}

bootstrap();
