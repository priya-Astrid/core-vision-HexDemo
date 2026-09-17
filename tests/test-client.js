// test-client.js
const { io } = require("socket.io-client");
const logger = require("../utils/logger");

const socket = io("http://localhost:3000", {
  transports: ["polling","websocket"],
});

socket.on("connect", () => {
  console.log("✅ Connected:", socket.id);
});

socket.on("deviceStatus", (data) => {
  console.log("📡 deviceStatus received:", data);
});

socket.on("disconnect", () => console.log("❌ disconnected"));
socket.on("connect_error", (err) => console.log("connect_error:", err.message));