/**
 * so server.js can import from config/ consistently.
 */
const { initWebSocket, getWss } = require("../websocket/socketServer");

module.exports = { initWebSocket, getWss };