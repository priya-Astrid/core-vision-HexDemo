const logger = require("../../utils/logger");
const { getChannel } = require("../../config/rabbitmq");
const AUDIT_QUEUE = process.env.AUDIT_QUEUE || "audit_queue";
async function publishAuditEvent(data) {
  try {
    const channel = getChannel();
    await channel.assertQueue(AUDIT_QUEUE, { durable: true });
    const payload = {
      imei: data.imei,
      vin: data.vin || null,
      organization: data.organization || null,
      timestamp: new Date().toString(),
    };
    await channel.sendToQueue(
      AUDIT_QUEUE,
      Buffer.from(JSON.stringify(payload)),
      { persistent: true },
    );
    logger.info(
      {
        imei: payload.imei,
        vin: payload.vin,
        organization: payload.organization,
        queue: AUDIT_QUEUE,
      },
      "Audit event published to RabbitMQ",
    );
  } catch (error) {
    logger.error({
      message: `failed to publish audit event`,
      error: error.message,
    });
  }
}
module.exports = {
  publishAuditEvent,
};
