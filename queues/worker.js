const { getChannel } = require("../config/rabbitmq");
const Telemetry = require("../modules/telemetry/telemetry.model");
const TelemetryHistory = require("../modules/telemetry/telemetryhistory.model");
const { getRedis } = require("../config/redis");
const Device = require("../modules/device/device.model");
const { emitDeviceStatus } = require("../websocket/device.socket");
const {
  evaluateTelemetryRules,
} = require("../modules/ruleEngine/ruleEngine.service");
const {
  evaluateNotifications,
} = require("../modules/ruleEngine/notificationRule.service");
const logger = require("../utils/logger");
const { resolveVinAndAudit } = require("../modules/audit/audit.service");

const TELEMETRY_QUEUE = process.env.RABBITMQ_QUEUE || "telemetry_queue";

// Tuning constant
const BATCH_SIZE = 50; // flush when this many messages collected
const FLUSH_INTERVAL_MS = 500; // flush every 500ms even if batch not full

let batch = [];
let flushTimer = null;

// MongoDB document
async function normalizePayload(payload) {
  const organization = await getOrganizationFromImei(payload.imei);
  return {
    imei: payload.imei,
    organization: organization,
    vin: payload.vin || null,
    location: payload.deviceData?.location || null,
    power: payload.deviceData?.power || null,
    engine: payload.deviceData?.engine || null,
    fuel: payload.deviceData?.fuel || null,
    temperature: payload.deviceData?.temperature || null,
    event: payload.deviceData?.event || null,
    canData: payload.canData || null,
    receivedAt: payload.receivedAt ? new Date(payload.receivedAt) : new Date(),
  };
}

async function getOrganizationFromImei(imei) {
  const redis = getRedis();
  const cacheKey = `device_org:${imei}`;

  try {
    // 1. Check Redis
    const cached = await redis.get(cacheKey);
    if (cached) {
      return cached;
    }

    // 2. Query MongoDB
    const device = await Device.findOne({ imei }).select("organization");

    if (!device) {
      return null;
    }

    const organizationId = device.organization.toString();

    // 3. Cache it for 10 minutes
    await redis.set(cacheKey, organizationId, "EX", 600);
    return organizationId;
  } catch (err) {
    logger.error(`Redis cache lookup failed: ${err.message}`);
    return null;
  }
}

// Flush batch to MongoDB
async function flushBatch(channel) {
  if (batch.length === 0) return;

  const current = batch.splice(0, batch.length);

  const docs = current.map((item) => item.doc);
  const msgs = current.map((item) => item.msg);

  try {
    // const savedDocs = await Telemetry.insertMany(docs, { ordered: false });
    // telemtry upsert latest data packet
    const savedDocs = await Promise.all(
      docs.map((doc) =>
        Telemetry.findOneAndUpdate(
          { imei: doc.imei },
          { $set: doc },
          { upsert: true, returnDocument: "after" },
        ),
      ),
    );
    //  telemetry history  insert 100 records

    const ONLINE_EVENT = new Set(["Pwrconn", "Heartbeat"]);
    const OFFLINE_EVENT = new Set(["Pwrdisconn"]);
    await Promise.all(
      docs.map((doc) => {
        const eventName = doc.event?.eName;
        const update = {
          last_packet_received: doc.receivedAt,
        };
        //  status decide karo
        if (ONLINE_EVENT.has(eventName)) {
          update.status = "online";
        } else if (OFFLINE_EVENT.has(eventName)) {
          update.status = "offline";
        }
        return Device.updateOne(
          {
            imei: doc.imei,
          },
          {
            $set: update,
          },
        ).then(() => {
          if (update.status) {
            emitDeviceStatus({
              imei: doc.imei,
              status: update.status,
            });
          }
        });
      }),
    );

    try {
      const historyDocs = await TelemetryHistory.insertMany(docs);

      const uniqueImei = [...new Set(docs.map((d) => d.imei))];
      // cleanup per imei
      for (const imei of uniqueImei) {
        const count = await TelemetryHistory.countDocuments({ imei });
        if (count > 100) {
          const excess = count - 100;
          // find old record delete
          const oldRecord = await TelemetryHistory.find({ imei })
            .sort({ receivedAt: 1 })
            .limit(excess)
            .select("_id");

          const idToDel = oldRecord.map((r) => r._id);

          await TelemetryHistory.deleteMany({
            _id: { $in: idToDel },
          });
        }
      }
    } catch (error) {
      logger.error(`Telemetry history insert failed: ${error.message}`);
    }

    msgs.forEach((msg) => channel.ack(msg));

    logger.info(`Batch flushed: ${docs.length} records saved to MongoDB`);

    // Evaluate rules for each telemetry record
    for (const doc of savedDocs) {
      try {
        const organizationId = await getOrganizationFromImei(doc.imei);

        if (!organizationId) {
          logger.warn(`Organization not found for IMEI: ${doc.imei}`);
          continue;
        }

        // const triggeredRules = await evaluateTelemetryRules(
        //   { deviceData: doc },
        //   organizationId
        // );
        const triggeredRules = await evaluateNotifications(
          { deviceData: doc },
          organizationId,
        );
        if (triggeredRules.length) {
          logger.info(
            {
              imei: doc.imei,
              rules: triggeredRules.map((r) => r.name),
            },
            "Rules triggered",
          );
        }
      } catch (err) {
        logger.error(`Rule evaluation error: ${err.message}`);
      }
    }
  } catch (error) {
    logger.error(`Batch insert failed: ${error.message}`);

    msgs.forEach((msg) => channel.nack(msg, false, false));
  }
}

// Start worker
async function startTelemetryWorker() {
  try {
    const channel = getChannel();

    await channel.assertQueue(TELEMETRY_QUEUE, { durable: true });

    channel.prefetch(100);

    logger.info(
      `Telemetry worker started | queue: ${TELEMETRY_QUEUE} | batch: ${BATCH_SIZE} | flush: ${FLUSH_INTERVAL_MS}ms`,
    );

    flushTimer = setInterval(() => flushBatch(channel), FLUSH_INTERVAL_MS);

    //Consume messages
    channel.consume(
      TELEMETRY_QUEUE,
      async (msg) => {
        if (!msg) return;

        try {
          const payload = JSON.parse(msg.content.toString());
          if (!payload.imei) {
            logger.warn("Worker received packet without imei — discarding");
            channel.nack(msg, false, false);
            return;
          }

          const device = await Device.findOne({ imei: payload.imei }).select(
            "organization",
          );
          if (device?.organization) {
            const organization = device.organization.toString();
            payload.organization = organization;
          }

          const updatedPayload = await resolveVinAndAudit(payload);

          const telemetryDoc = await normalizePayload(updatedPayload);
          // Buffer the message
          batch.push({ doc: telemetryDoc, msg });

          logger.debug(
            { imei: payload.imei, batchSize: batch.length },
            "Packet buffered",
          );

          if (batch.length >= BATCH_SIZE) {
            flushBatch(channel);
          }
        } catch (error) {
          logger.error(`Worker parse error: ${error.message}`);
          channel.nack(msg, false, false);
        }
      },
      { noAck: false },
    );
  } catch (error) {
    logger.error(`Failed to start telemetry worker: ${error.message}`);
    throw error;
  }
}

//Graceful shutdown
async function stopTelemetryWorker(channel) {
  if (flushTimer) clearInterval(flushTimer);
  if (channel) await flushBatch(channel);
  logger.info("Telemetry worker stopped");
}

module.exports = { startTelemetryWorker, stopTelemetryWorker };
