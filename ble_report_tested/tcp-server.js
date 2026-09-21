const net = require("net");
const publishPacket = require("./queue/publisher");

const HOST = "127.0.0.1";
const PORT = 5000;

function detectionFormat(buffer){
  if(buffer.length < 3){
    return null;
  }
  if(buffer[0] === 0x8b){
    return "ZIP_BSA"
  }

if (buffer[0] === 0x8d) {
    return "ZIP_BSA";
}
  const prefix = buffer.subarray(0, 3).toString("ascii");

  if (prefix === "BLE") {
    return "ASCII_BLE";
  }

  if (prefix === "BSA") {
    return "ASCII_BSA";
  }

  return "UNKNOWN"
}
const data = async () => {
   const server = net.createServer((socket) => {
    console.log("device connected: ", socket.remoteAddress, socket.remotePort);
    let pendingBuffer = Buffer.alloc(0);
    socket.on("data", async (chunk) => {
      console.log(`received ${chunk.length} bytes`);
      // add newly received data to pending data
      pendingBuffer = Buffer.concat([pendingBuffer, chunk]);
      // try to extract complete packets
      while (pendingBuffer.length >= 3) {
        const HDR = pendingBuffer.readUint8(0);
        const PKT_LEN = pendingBuffer.readUint16BE(1);

        // our protocol says:
        // complete packet = HDR(1)+ PKT_LEN(2)+ZIP data(PKT_LEN)
        const packetLength = 3 + PKT_LEN;
        // wait until complete packet arrives
        if (pendingBuffer.length < packetLength) {
          break;
        }
        // extract exactly one complete packet

        const packet = pendingBuffer.subarray(0, packetLength);
        // remove processed packet from pending buffer
        pendingBuffer = pendingBuffer.subarray(packetLength);
        console.log(
          `complete packet received ${packet.length}bytes , HDR:${HDR}`,
        );
        console.log("hex", packet.toString("hex"));

        //   rabbitmq store hex data

        await publishPacket(packet)
         }
    });
    socket.on("close", () => {
      console.log("Device discconected");
    });
    socket.on("error", (error) => {
      console.log("server error", error.message);
    });
  });
  server.on("error", (error) => {
    console.error("server error", error.message);
  });
  server.listen(PORT, HOST, () => {
    console.log(`TCP server listing on ${HOST}:${PORT}`);
  });
};
data();
