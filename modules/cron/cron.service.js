const cron = require("node-cron");
const { getInventory } = require("./idmsInventorySync.service");
const logger = require("../../utils/logger")
 let isRunning = false;
  
cron.schedule("0 0 * * * *", async () => {
 if (isRunning){
    logger.info("cron already running")
 };
  isRunning = true;
  try {
    await getInventory();
    logger.info("cron run automatically");
  } finally {
    isRunning = false;
  }
});
