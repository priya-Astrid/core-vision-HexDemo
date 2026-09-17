
const filterConfig = {
  speed: {
    field: "engine.spdKmph",
    operator: "$gt",
  },
  rpm: {
    field: "engine.rpm",
    operator: "$gt",
  },
  lowFuel: {
    field: "fuel.level",
    operator: "$lte",
  },
  assetBattery: {
    field: "power.main",
    operator: "$lte",
  },
  deviceBattery: {
    field: "power.battery",
    operator: "$lt",
  },
  odoMeter: {
    field: "engine.odoMeter",
    operator: "$gt",
  },
};
module.exports = filterConfig;
