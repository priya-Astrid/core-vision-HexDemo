const twilio = require("twilio");
const logger = require("../utils/logger");
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN,
);

async function sendSMS(to, message) {
  try {
    const sms = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE,
      to: to,
    });
    logger.info({ sid: sms.sid, to: to }, "SMS sent successfully");

    return sms;
  } catch (error) {
    logger.error(
      {
        error: error.message,
        to,
      },
      "SMS sending failed",
    );
    throw error;
  }
}

module.exports = { sendSMS };
