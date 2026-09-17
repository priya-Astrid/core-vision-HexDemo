const mongoose = require("mongoose");
const Telemetry = require("./telemetry.model");
const telemetryHistorySchema = Telemetry.schema.clone();
module.exports = mongoose.model("telemetry_event_history", telemetryHistorySchema);