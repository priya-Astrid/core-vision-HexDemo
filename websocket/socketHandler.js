const logger = require("../utils/logger");
const { publishTelemetry } = require("../queues/telemetry.queue");

/**
 * Handle a new WebSocket connection
 * @param {WebSocket} ws
 * @param {http.IncomingMessage} req
 */
function handleConnection(ws, req) {
  ws.isAlive = true;

  // Heartbeat: respond to pings
  ws.on("pong", () => {
    ws.isAlive = true;
  });

  ws.on("message", async (raw) => {
    try {
      const rawMessage = raw.toString();
      console.log("[Socket] Message received : ",rawMessage);
      const message = JSON.parse(rawMessage);

      if (!message || !message.imei) {
        ws.send(
          JSON.stringify({
            success: false,
            error: "Invalid packet: imei is required",
          })
        );
        return;
      }

      if (!message.deviceData && !message.canData) {
        ws.send(
          JSON.stringify({
            success: false,
            error: "Invalid packet: deviceData or canData is required",
          })
        );
        return;
      }

      logger.info(
        {
          imei: message.imei,
          eType: message.deviceData?.event?.eType,
          eName: message.deviceData?.event?.eName,
        },
        "Telemetry packet received"
      );
             // Publish to RabbitMQ
      await publishTelemetry(message);

      ws.send(
        JSON.stringify({
          success: true,
          imei: message.imei,
          queued: true,
        })
      );
    } catch (error) {
      if (error instanceof SyntaxError) {
        logger.warn("Received non-JSON WebSocket message");
        ws.send(
          JSON.stringify({ success: false, error: "Message must be valid JSON" })
        );
      } else {
        logger.error(`Error handling WebSocket message: ${error.message}`);
        ws.send(
          JSON.stringify({ success: false, error: "Internal processing error" })
        );
      }
    }
  });

  ws.on("close", (code) => {
    logger.info(`WebSocket client disconnected. Code: ${code}`);
  });

  ws.on("error", (error) => {
    logger.error(`WebSocket client error: ${error.message}`);
  });

  ws.send(
    JSON.stringify({
      type: "connected",
      message: "Connected to CoreVision Telemetry WebSocket",
    })
  );
}

/**
 * Ping all clients every 30s to detect stale connections
 */
function startHeartbeat(wss) {
  const interval = setInterval(() => {
    wss.clients.forEach((ws) => {
      if (!ws.isAlive) {
        logger.warn("Terminating stale WebSocket connection");
        return ws.terminate();
      }
      ws.isAlive = false;
      ws.ping();
    });
  }, 30000);

  wss.on("close", () => clearInterval(interval));
  return interval;
}

module.exports = { handleConnection, startHeartbeat };