const net = require("net");

const HOST = "127.0.0.1";
const PORT = 3000;
const asciiPacket =
  "BLE;0820012345;82;1.0.0;20191203;17:00:51;+32.691615;-117.297160;2;\n";
const packet = Buffer.from(asciiPacket, "ascii");

const socket = new net.Socket();
socket.connect(PORT, HOST, () => {
  console.log(`connected to tcp server ${HOST} : ${PORT}`);
  startSending();
});
let packetCount = 0;
function startSending() {
  setInterval(() => {
    packetCount++;

    const canWrite = socket.write(packet);

    console.log(
      `Packet ${packetCount} sent | ${packet.length} bytes | canWrite=${canWrite}`,
    );
  }, 10000);
}

console.log("this packet", packet);

socket.on("close", () => {
  console.log("connect closed");
});
socket.on("error", () => {
  console.log("connection closed");
});
socket.on("error", (error) => {
  console.error("Socket error", error.message);
});
