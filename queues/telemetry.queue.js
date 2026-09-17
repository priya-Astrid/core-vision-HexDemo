const { getChannel } = require("../config/rabbitmq");
const logger = require("../utils/logger");

const TELEMETRY_QUEUE = process.env.RABBITMQ_QUEUE || "telemetry_queue";

/**
 * Publish a device telemetry packet to RabbitMQ.
 */
async function publishTelemetry(data) {
  try {
    const channel = getChannel();

    await channel.assertQueue(TELEMETRY_QUEUE, { durable: true });

    // Validate minimum required field
    if (!data.imei) {
      throw new Error("Packet missing required field: imei", 400);
    }

    const payload = {
      imei: data.imei.trim(),
      vin: data.vin || null,
      deviceData: data.deviceData || null,
      canData: data.canData || null,         // DTC error if present
      receivedAt: new Date().toISOString(),  // server-side timestamp
    };
   
    channel.sendToQueue(
      TELEMETRY_QUEUE,
      Buffer.from(JSON.stringify(payload)),
      { persistent: true }
    );

    logger.info(
      {
        imei: payload.imei,
        eType: payload.deviceData?.event?.eType,
        eName: payload.deviceData?.event?.eName,
        queue: TELEMETRY_QUEUE,
      },
      "Telemetry published to RabbitMQ"
    );
  } catch (error) {
    logger.error(`Failed to publish telemetry: ${error.message}`);
    throw error;
  }
}

module.exports = { publishTelemetry, TELEMETRY_QUEUE };