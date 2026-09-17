const mongoose = require("mongoose");

const EVENT_TYPES = {
  1: "Heartbeat",
  2: "Stop",
  3: "Sleep",
  4: "Moving",
  5: "Pwrconn",
  6: "Pwrdisconn",
  7: "Periodboot",
  8: "Warmboot",
  9: "Coldboot",
  10: "Gpsacq",
};

const telemetrySchema = new mongoose.Schema(
  {
    organization:{
     type: mongoose.Schema.Types.ObjectId,
     ref:"Organization"
    },
    imei: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    vin:{
      type: String
    },
    location: {
      lat: { type: Number },
      long: { type: Number },
      hac: { type: Number },        // horizontal accuracy
      satellites: { type: Number },
      rssi: { type: Number },       // cellular signal strength
    },
    power: {
      main: { type: Number },
      battery: { type: Number },
    },
    engine: {
      spdKmph: { type: Number },
      rpm: { type: Number },
      odoMeter: { type: Number },
    },
    fuel: {
      type: { type: String },
      level: { type: Number },
    },
    temperature: {
      oil: { type: Number }, 
    },
    event: {
      eType: {
        type: Number,
        enum: Object.keys(EVENT_TYPES).map(Number),
      },
      eName: { type: String },
    },

    // DTC Error 
    canData: {
      code: { type: String, default: null }, // e.g. "P0130"
    },
    receivedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);


module.exports = mongoose.model("Telemetry", telemetrySchema);
module.exports.EVENT_TYPES = EVENT_TYPES;