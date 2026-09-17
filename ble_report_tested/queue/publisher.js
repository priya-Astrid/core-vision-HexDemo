const { getChannel, connectRabbitMQ } = require("../../config/rabbitmq");

const HEX_QUEUE = "hex_data_Queue";
async function publishPacket(packet) {
  try {
    await connectRabbitMQ();
    console.log("packet",packet)
    const channel = getChannel();
    await channel.assertQueue(HEX_QUEUE, { durable: true });
    await channel.sendToQueue(HEX_QUEUE, packet, { persistent: true });
  } catch (error) {
    console.log("error hangling", error.message);
  }
}
module.exports = publishPacket;
