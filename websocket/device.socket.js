const { getIO } = require("./socketio");

function emitDeviceStatus(device) {
  const io = getIO();
   if(!io) return;
  io.emit("deviceStatus", device);
}
module.exports={
    emitDeviceStatus
}
