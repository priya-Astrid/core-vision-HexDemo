const { DEFAULT_THRESHOLD } = require("./dashboard.constant");
const logger = require("../../utils/logger");
const getInventoryInfo = (item) => ({
  stockNumber: item.inventory?.stockNumber,
  model: item.inventory?.model,
  make: item.inventory?.make,
  color: item.inventory?.color,
  year: item.inventory?.year,
});
const transformers = {
  disconnectedAssets: (item, threshold) => ({
    
    imei: item.imei,
    battery : item.power?.battery,
    lastSeen: item.receivedAt,
    location: item.location,
    ...getInventoryInfo(item),
  }),
  speedAlerts: (item, threshold = {}) => ({
    imei: item.imei,
    spdKmph: item.engine?.spdKmph,
    overBy: +(
      item.engine?.spdKmph -
      (threshold.speedLimit || DEFAULT_THRESHOLD.speedLimit)
    ).toFixed(1),
    location: item.location,
    receivedAt: item.receivedAt,
    ...getInventoryInfo(item),
  }),
  assetBattery: (item, threshold = {}) => ({
    imei: item.imei,
    battery: item.power?.battery,
    below: +(
      (threshold.assetBattery || DEFAULT_THRESHOLD.assetBattery) -
      item.power?.battery
    ).toFixed(1),
    location: item.location,
    receivedAt: item.receivedAt,
    ...getInventoryInfo(item),
  }),
  geofenceViolations: (item) => ({
    imei: item.imei,
    event: item.event,
    location: item.location,
    receivedAt: item.receivedAt,
    ...getInventoryInfo(item)
  }),
  lowFuelAlerts: (item, threshold = {}) => ({
    imei: item.imei,
    fuelLevel: item.fuel?.level,
    below: +(
      item.fuel?.level - (threshold.fuelMax || DEFAULT_THRESHOLD.fuelMax)
    ).toFixed(1),
    location: item.location,
    receivedAt: item.receivedAt,
    ...getInventoryInfo(item)

  }),
  odometerLimitAlerts: (item, threshold = {}) => ({
    imei: item.imei,
    odoMeter: item.engine?.odoMeter,
    overBy: +(
      item.engine.odoMeter - (threshold.odoLimit || DEFAULT_THRESHOLD.odoLimit)
    ).toFixed(1),
    location: item.location,
    receivedAt: item.receivedAt,
    ...getInventoryInfo(item)
  }),
  rpmLimitAlerts: (item, threshold = {}) => ({
    imei: item.imei,
    rpm: item.engine?.rpm,
    overBy: +(
      item.engine?.rpm - (threshold.rpmLimit || DEFAULT_THRESHOLD.rpmLimit)
    ).toFixed(1),
    location: item.location,
    receivedAt: item.receivedAt,
    ...getInventoryInfo(item)
  }),
  idleAssetsAlerts: (item, threshold = {}) => ({
    imei: item.imei,
    spdKmph: item.engine?.spdKmph,
    idleSince: item.receivedAt,
    idleMinutes: threshold.idleMinutes || DEFAULT_THRESHOLD.idleMinutes,
    location: item.location,
    receivedAt: item.receivedAt,
    ...getInventoryInfo(item)
  }),
};

const transformWidgetData = (type, data, threshold = {}, page, limit) => {
  const transformer = transformers[type];
  if (!transformer) {
    logger.warn(`No transformer found her type: ${type}, returning raw data`);
    return data;
  }
  return data.map((item) => transformer(item, threshold));
};
module.exports = { transformWidgetData };
