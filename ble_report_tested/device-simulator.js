
const net = require("net");
const HOST = "127.0.0.1";
const PORT = 5000;

const simpleHex = `8B 00 34 08 20 01 23 45 52 01 00 00 13 0C 03 11 00 33 01 F2 D5 9F  86 FD D0 08 02 E0 9C 21 AA BB CC DD EE FF 0C 00 12 00 
34 D9 D4 2C 11 22 33 44 55 66 20 00 45 00 65`;

const packet = Buffer.from(simpleHex.replace(/\s/g, ""), "hex");

const socket = new net.Socket();
socket.connect(PORT, HOST, () => {
  console.log(`connected to TCP Server ${HOST} : ${PORT}`);
  console.log(`packet size: ${packet.length} bytes`);
  startSending();
});

let packetCount = 0;

function startSending() {
  setInterval(() => {
    packetCount++;
    const canWrite = socket.write(packet);
    console.log(`
            Packet ${packetCount} sent  | ${packet.length} bytes | canWrite =${canWrite} `);
  }, 1000);
}
socket.on("close", () => {
  console.log("connection closed");
});
socket.on("error", (error) => {
  console.error("socket error: ", error.message);
});
