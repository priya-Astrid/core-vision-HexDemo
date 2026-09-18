const net = require("net");
const publishPacket = require("../ble_report_tested/queue/publisher");
const { connectRabbitMQ } = require("../config/rabbitmq");
const AsciiPacket = require("./queue/publisher");

const HOST = "127.0.0.1";
const PORT = 3000;

function detectFormat(buffer) {
  if (buffer.length < 3) {
    return null;
  }
  if (buffer[0] === 0x8b) {
    return "ZIP_BLE";
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

  return "UNKNOWN";
}
const server = net.createServer((socket) => {
  console.log("device connected: ", socket.remoteAddress, socket.remotePort);
  let pendingBuffer = Buffer.alloc(0);
  socket.on("data", async(chunk) => {
    await connectRabbitMQ();
 try {
      console.log("Received chunk:", chunk.length, "bytes");

      // TCP chunk ko buffer me add karo
      pendingBuffer = Buffer.concat([
        pendingBuffer,
        chunk,
      ]);

      // Ek TCP chunk me multiple packets bhi ho sakte hain,
      // isliye while use karenge.
      while (pendingBuffer.length >= 3) {
        const format = detectFormat(pendingBuffer);

        console.log("Detected format:", format);

        // --------------------------------
        // ZIP PACKET
        // --------------------------------
        if (
          format === "ZIP_BLE" ||
          format === "ZIP_BSA"
        ) {
          const PKT_LEN = pendingBuffer.readUInt16BE(1);

          const packetLength = 3 + PKT_LEN;

          // Complete packet abhi nahi aaya
          if (pendingBuffer.length < packetLength) {
            break;
          }

          // Complete packet extract karo
          const packet = pendingBuffer.subarray(
            0,
            packetLength
          );

          // Buffer se processed packet remove karo
          pendingBuffer = pendingBuffer.subarray(
            packetLength
          );

          console.log(
            `Complete ${format} packet:`,
            packet.length,
            "bytes"
          );

          console.log(
            "HEX:",
            packet.toString("hex")
          );

          // RabbitMQ
          await publishPacket(packet, format);

          continue;
        }

        // --------------------------------
        // ASCII PACKET
        // --------------------------------
        if (
          format === "ASCII_BLE" ||
          format === "ASCII_BSA"
        ) {
          console.log(
            `ASCII packet detected: ${format}`
          );

          const endIndex = pendingBuffer.indexOf(0x0a);
          if(endIndex === -1){
            break ;
          }
          const packet = pendingBuffer.subarray(
            0,
            endIndex

          )
          pendingBuffer = pendingBuffer.subarray(
            endIndex+1
          )
          console.log(`complete ${format} packet`, packet, format);
          // rabbitmq
          await AsciiPacket(packet, format);
          // ASCII framing abhi pending hai.

          continue;
        }

        // --------------------------------
        // UNKNOWN PACKET
        // --------------------------------
        if (format === "UNKNOWN") {
          console.log("Unknown packet format");

          // Abhi connection close nahi karenge.
          // Production me yahan resync logic add karenge.
          break;
        }
      }
    } catch (error) {
      console.error(
        "TCP data processing error:",
        error.message
      );
    }
  });


    socket.on("close", () => {
      console.log("Device discconected");
    });
    socket.on("error", (error) => {
      console.log("socket error", error.message);
    });
  });
server.on("error", (error) => {
  console.error("server error", error.message);
});
server.listen(PORT, HOST, () => {
  console.log(`TCP server listing on ${HOST}:${PORT}`);
});
