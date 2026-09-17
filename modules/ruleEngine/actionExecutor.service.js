const { sendMail } = require("../../config/email.config");
const { getRedis } = require("../../config/redis");
const { sendSMS } = require("../../config/sms.config");
const logger = require("../../utils/logger");
const eventService = require("../event/event.service");

async function executeRuleActions(rule, telemetry) {
  const actions = rule.actions || [];

  const imei = telemetry.deviceData?.imei || telemetry.imei;

  const alreadyTriggered = await isRuleAlreadyTriggered(imei, rule._id);

  if (alreadyTriggered) {
    logger.debug(
      { imei, rule: rule.name },
      "Rule already triggered recently, skipping",
    );
    return;
  }

  for (const action of actions) {
    switch (action) {
      case "Notification":
        await createNotification(rule, telemetry);
        break;

      case "Sms":
        await sendSms(rule, telemetry);
        break;

      case "Email":
        await sendEmail(rule, telemetry);
        break;

      default:
        logger.warn(`Unknown action type: ${action}`);
    }
  }
}

async function createNotification(rule, telemetry) {
  const imei = telemetry.deviceData?.imei || telemetry.imei;

  const eventData = {
    type: rule.name,
    imei: imei,
    vehicleId: telemetry.vehicleId,
    message: `${rule.name} alert triggered`,
    telemetry: telemetry,
  };

  await eventService.createEvent(eventData);
  logger.info(
    {
      rule: rule.name,
      imei: telemetry.deviceData?.imei,
    },
    "Notification triggered",
  );
}

async function sendSms(rule, telemetry) {
  const to = telemetry.vehicleData?.ownerPhone;
  if (!to) {
    logger.warn("owner phone number not found");
    return;
  }
  const message = `${rule.name} trigger for vehicle ${telemetry.vehicleId} `;

  await sendSMS(to, message).catch((err) => {
    logger.error(err, "sms failed");
  });
  logger.info(
    {
      rule: rule.name,
      imei: telemetry.deviceData?.imei,
    },
    "SMS action triggered",
  );
}

async function sendEmail(rule, telemetry) {
  const email = telemetry.vehicleData?.ownerEmail;
  const subject = `${rule.name} Alert`;
  const message = `${rule.name} trigger for vehicle ${telemetry.vehicleId}`;

  if (!email) {
    logger.warn("owner email not found");
    return;
  }
  await sendMail(email, subject, message).catch((err) =>{
    logger.error(err, "email failed");
  });
  logger.info(
    {
      rule: rule.name,
      imei: telemetry.deviceData?.imei,
    },
    "Email action triggered",
  );
}

async function isRuleAlreadyTriggered(imei, ruleId) {
  const redis = getRedis();
  const key = `rule_triggered:${imei}:${ruleId}`;

  const exists = await redis.get(key);

  if (exists) {
    return true;
  }

  // Store trigger lock for 120 seconds
  await redis.set(key, "1", "EX", 120);

  return false;
}

module.exports = { executeRuleActions };