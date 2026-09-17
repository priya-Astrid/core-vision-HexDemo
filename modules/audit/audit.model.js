const mongoose = require("mongoose");

const auditSchema = new mongoose.Schema(
  {
    vin: {
      type: String,
      required: true,
      trim: true,
    },
    imei: {
      type: String,
      trim: true,
      required: true,
    },
    assignedAt: {
      type: Date,
      default: Date.now,
    },
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      
    },
    removedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);
module.exports = mongoose.model("Audit", auditSchema);
