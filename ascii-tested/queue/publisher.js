const { getChannel, connectRabbitMQ } = require("../../config/rabbitmq");


const ASCII_QUEUE = "ASCII_QUEUE";
async function AsciiPacket(packet, format) {
  try {
    await connectRabbitMQ();
    console.log("packet",packet)
   

    const channel = getChannel();
    await channel.assertQueue(ASCII_QUEUE, { durable: true });
    await channel.sendToQueue(ASCII_QUEUE, packet, { persistent: true,
      headers:{
        format: format
      }
     });
  } catch (error) {
    console.log("error hangling", error);
  }
}
module.exports = AsciiPacket;
