const WIDGET_TYPE = {
  DISCONNECTED_ASSETS: "disconnectedAssets",
  ASSET_BATTERY: "assetBattery",
  GEOFENCE_VIOLATIONS: "geofenceViolations",
  SPEED_ALERTS: "speedAlerts",
  RPM_LIMIT_ALERTS: "rpmLimitAlerts",
  ODOMETER_LIMIT_ALERTS: "odometerLimitAlerts",
  LOW_FUEL_ALERTS: "lowFuelAlerts",
  IDLE_ASSETS_ALERTS: "idleAssetsAlerts",
};

 const DEFAULT_THRESHOLD = {
   speedLimit : 60,
   assetBattery : 16,
   fuelMax: 15,
   odoLimit: 100000,
   rpmLimit: 4500,
   idleMinutes : 30,
   disconnect: 15
}
module.exports = { WIDGET_TYPE, DEFAULT_THRESHOLD };
