const { getChannel } = require("../../config/rabbitmq");
const logger = require("../../utils/logger");
const { getRedis } = require("../../config/redis");
const auditModel = require("./audit.model");
const { publishAuditEvent } = require("./audit.publisher");

const AUDIT_QUEUE = process.env.AUDIT_QUEUE || "audit_queue";
async function processAuditEvent(data) {
  //   const { imie, vin } = data;
  const existing = await auditModel.findOne({
    imei: data.imei,
    vin: data.vin,
   organization: data.organization,
    removedAt: null,
  });
  if (existing) return;
  //close previous mapping same vin active
 await auditModel.updateMany(
    {
      vin: data.vin,
         organization: data.organization,
      removedAt: null,
    },
    {
      $set: { removedAt: new Date() },
    },
  );
 
  // close previous mapping same imei active
   await auditModel.updateMany(
    {
      imei: data.imei,
         organization: data.organization,
      removedAt: null,
    },
    {
      $set: { removedAt: new Date() },
    },
  );
  //    create new mapping
  await auditModel.create({
    imei: data.imei,
    vin: data.vin,
    organization: data.organization,
    assignedAt: new Date(),
    removedAt: null,
  });
  logger.info(
    `Updated audit mapping for IMEI ${data.imei} and VIN ${data.vin}`,
  );
}
async function startAuditConsumer() {
  try {
    const channel = getChannel();
    await channel.assertQueue(AUDIT_QUEUE, { durable: true });
    channel.prefetch(10);
    logger.info("Audit consumer started");
    channel.consume(AUDIT_QUEUE, async (msg) => {
      if (!msg) return;
      try {
        const payload = JSON.parse(msg.content.toString());
        logger.info("Received audit event:", payload);
        // if (!payload.imei) {
        //   channel.nack(msg, false, false);
        //   return;
        // }
        await processAuditEvent(payload);
        channel.ack(msg);
      } catch (error) {
        logger.error({
          message: `Failed to process audit event: `,
          error: error.message,
        });
      }
    });
  } catch (error) {
    logger.error({
      message: "Failed to start audit consumer: ",
      error: error.message,
    });
  }
}
module.exports = {
  startAuditConsumer,
};
