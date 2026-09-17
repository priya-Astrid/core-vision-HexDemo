const Redis = require("ioredis");
const logger = require("../utils/logger");

let client = null;

async function connectRedis() {
  client = new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
    lazyConnect: true,
    retryStrategy: (times) => Math.min(times * 500, 5000),
  });

  client.on("connect", () => logger.info("Redis connected successfully"));
  client.on("error", (err) => logger.error(`Redis error: ${err.message}`));

  await client.connect();
  return client;
}

function getRedis() {
  if (!client) throw new Error("Redis not initialized yet");
  return client;
}

module.exports = { connectRedis, getRedis };
