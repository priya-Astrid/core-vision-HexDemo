const Notification = require("../notification/notification.model");
const logger = require("../../utils/logger");
const { getRedis } = require("../../config/redis");
const { sendMail } = require("../../config/email.config");
const { sendSMS } = require("../../config/sms.config");
/**
 * Get nested field value
 */
function getFieldValue(object, path) {
  return path.split(".").reduce((obj, key) => obj?.[key], object);
}

/**
 * Prevent duplicate notification
 */
async function isNotificationAlreadyTriggered(imei, notificationId) {
  const redis = getRedis();

  const key = `notification_triggered:${imei}:${notificationId}`;

  const exists = await redis.get(key);

  /**
   * Already triggered recently
   */
  if (exists) {
    return true;
  }

  /**
   * Store lock for 120 sec
   */
  await redis.set(key, "1", "EX", 120);

  return false;
}

/**
 * Evaluate dynamic rule string
 */
function evaluateRuleString(ruleString, telemetryData) {
  try {
    /**
     * Replace {field}
     * with telemetry value
     */
    const parsedRule = ruleString.replace(/\{(.*?)\}/g, (_, key) => {
      const value = getFieldValue(telemetryData.deviceData, key.trim());

      /**
       * String value
       */
      if (typeof value === "string") {
        return `"${value}"`;
      }

      return value;
    });

    /**
     * Example:
     * 12.5 > 10 &&
     * 50 > 20
     */

    return eval(parsedRule);
  } catch (error) {
    logger.error(`Rule evaluation failed: ${error.message}`);

    return false;
  }
}

/**
 * Check day match
 */
function isDayMatched(notification) {
  if (notification.availabilityPeriod?.allDays) {
    return true;
  }

  const currentDay = new Date().toLocaleString("en-US", {
    weekday: "long",
  });

  const allowedDays = notification.availabilityPeriod?.days || [];

  return allowedDays.includes(currentDay);
}

/**
 * Check time match
 */
function isTimeMatched(notification) {
  if (notification.timeDuration?.anyTime) {
    return true;
  }

  const from = notification.timeDuration?.from;

  const to = notification.timeDuration?.to;

  if (!from || !to) {
    return false;
  }

  const now = new Date();

  const currentTime =
    now.getHours().toString().padStart(2, "0") +
    ":" +
    now.getMinutes().toString().padStart(2, "0");

  return currentTime >= from && currentTime <= to;
}

/**
 * Build dynamic message
 */
function buildDynamicMessage(message, telemetryData) {
  return message.replace(/\{\{(.*?)\}\}/g, (_, key) => {
    const value = getFieldValue(telemetryData.deviceData, key.trim());

    return value ?? "";
  });
}

/**
 * Send notification
 */
async function sendNotification(notification, telemetryData) {
  try {
    const imei = telemetryData.deviceData?.imei || telemetryData.imei;

    /**
     * Prevent duplicate trigger
     */
    const alreadyTriggered = await isNotificationAlreadyTriggered(
      imei,
      notification._id,
    );

    if (alreadyTriggered) {
      logger.info(
        `Notification already triggered recently: ${notification.name}`,
      );

      return;
    }

    /**
     * Dynamic message
     */
    const dynamicMessage = buildDynamicMessage(
      notification.message,
      telemetryData,
    );

    logger.info(`Message: ${dynamicMessage}`);

    for (const recipient of notification.recipients) {
      /**
       * EMAIL
       */
      if (recipient.deliveryMethod === "Email" && recipient.email) {
        try {
          await sendMail(recipient.email, notification.name, dynamicMessage);
          logger.info(`Email sent to ${recipient.email}`);
        } catch (err) {
          logger.error(
            `Email send failed to ${recipient.email}: ${err.message}`,
          );
        }
        // TODO:
        // Nodemailer logic
      }

      /**
       * SMS
       */
      if (recipient.deliveryMethod === "SMS" && recipient.phoneNumber) {
        try {
          await sendSMS(recipient.phoneNumber, dynamicMessage);
          logger.info(`SMS sent to ${recipient.phoneNumber}`);
        } catch (err) {
          logger.error(
            `SMS send failed to ${recipient.phoneNumber}: ${err.message}`,
          );
        }

        // TODO:
        // Twilio logic
      }
    }
  } catch (error) {
    logger.error(`Notification send failed: ${error.message}`);
  }
}

/**
 * Get notifications
 */
async function getOrganizationNotifications(organizationId) {
  const redis = getRedis();

  const cacheKey = `notifications:${organizationId}`;

  try {
    /**
     * Redis cache
     */
    const cachedNotifications = await redis.get(cacheKey);

    if (cachedNotifications) {
      return JSON.parse(cachedNotifications);
    }

    /**
     * MongoDB
     */
    const notifications = await Notification.find({
      organization: organizationId,
      status: "Active",
    }).lean();

    /**
     * Cache 5 mins
     */
    await redis.set(cacheKey, JSON.stringify(notifications), "EX", 300);

    return notifications;
  } catch (error) {
    logger.error(`Notification cache error: ${error.message}`);

    return Notification.find({
      organization: organizationId,
      status: "Active",
    }).lean();
  }
}

/**
 * Main function
 */
async function evaluateNotifications(telemetryData, organizationId) {
  try {
    /**
     * Get notifications
     */
    const notifications = await getOrganizationNotifications(organizationId);

    if (!notifications.length) {
      return [];
    }

    const triggeredNotifications = [];

    /**
     * Loop notifications
     */
    for (const notification of notifications) {
      /**
       * STEP 1
       * Check day
       */
      if (!isDayMatched(notification)) {
        logger.info(`Day mismatch: ${notification.name}`);

        continue;
      }

      /**
       * STEP 2
       * Check time
       */
      if (!isTimeMatched(notification)) {
        logger.info(`Time mismatch: ${notification.name}`);

        continue;
      }

      /**
       * STEP 3
       * Evaluate conditions
       */
      const matched = evaluateRuleString(
        notification.ruleString,
        telemetryData,
      );
      if (!matched) {
        logger.info(`Conditions not matched: ${notification.name}`);

        continue;
      }

      /**
       * STEP 4
       * Triggered
       */
      logger.info(`Notification triggered: ${notification.name}`);

      triggeredNotifications.push(notification);

      /**
       * STEP 5
       * Send notification
       */
      await sendNotification(notification, telemetryData);
    }

    return triggeredNotifications;
  } catch (error) {
    logger.error(`Notification evaluation failed: ${error.message}`);

    return [];
  }
}

module.exports = {
  evaluateNotifications,
};
