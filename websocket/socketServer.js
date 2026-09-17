const WebSocket = require("ws");
const logger = require("../utils/logger");
const { handleConnection } = require("./socketHandler");

let wss = null;

function initWebSocket(server) {
  wss = new WebSocket.Server({ server, path: "/ws/telemetry" });

  logger.info("WebSocket server initialized on path: /ws/telemetry");

  wss.on("connection", (ws, req) => {
    const clientIp = req.socket.remoteAddress;
    logger.info(`New WebSocket client connected from: ${clientIp}`);

    handleConnection(ws, req);
  });

  wss.on("error", (error) => {
    logger.error("WebSocket Server Error:" + error.message);
  });

  return wss;
}

function getWss() {
  return wss;
}

module.exports = { initWebSocket, getWss };
