const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
    },
    imei: {
      type: String,
      required: true,
      index: true,
    },
    vehicleId: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    telemetry: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  { timestamps: true },
);

eventSchema.index({ createdAt: -1 });
module.exports = mongoose.model("Event", eventSchema);
