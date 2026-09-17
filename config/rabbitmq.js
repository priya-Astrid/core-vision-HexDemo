const amqp = require("amqplib");
const logger = require("../utils/logger");

let connection = null;
let channel = null;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Builds the AMQP URL safely.
 */
function buildUrl() {
  if (process.env.RABBITMQ_URL) {
    return process.env.RABBITMQ_URL;
  }
  const user = encodeURIComponent(process.env.RABBITMQ_USER || "guest");
  const pass = encodeURIComponent(process.env.RABBITMQ_PASS || "guest");
  const host = process.env.RABBITMQ_HOST || "localhost";
  const port = process.env.RABBITMQ_PORT || "5672";
  return `amqp://${user}:${pass}@${host}:${port}`;
}

/**
 * Connect with infinite while-loop retry.
 */
async function connectRabbitMQ() {
  const url = buildUrl();
  const maskedUrl = url.replace(/:([^:@/]+)@/, ":***@");

  while (true) {
    try {
      logger.info(`Connecting to RabbitMQ: ${maskedUrl}`);

      connection = await amqp.connect(url, { heartbeat: 60 });
      channel = await connection.createChannel();

      logger.info("RabbitMQ successfully connected");

      connection.on("close", () => {
        logger.warn("RabbitMQ connection closed — reconnecting in 5s...");
        connection = null;
        channel = null;
        // background reconnect — does not block
        setTimeout(() => connectRabbitMQ(), 5000);
      });

      connection.on("error", (err) => {
        logger.error(`RabbitMQ connection error: ${err.message}`);
      });

      return { connection, channel };
    } catch (error) {
      logger.error(`RabbitMQ connect failed: ${error.message || JSON.stringify(error)} — retrying in 5s...`);
      await sleep(5000);
    }
  }
}

function getChannel() {
  if (!channel) {
    throw new Error("RabbitMQ channel not initialized yet");
  }
  return channel;
}

module.exports = { connectRabbitMQ, getChannel };