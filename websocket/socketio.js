const { Server } = require("socket.io");
const logger = require("../utils/logger");
let io;

function initSocketIO(server) {
  io = new Server(server, {
    cors: {
      origin: "*",
    },
  });
  io.on("connection", (socket) =>{
    logger.info("connected", socket.id);
    
  })
  return io;
}
function getIO() {
  return io;
}
module.exports = {
  initSocketIO,
  getIO,
};
