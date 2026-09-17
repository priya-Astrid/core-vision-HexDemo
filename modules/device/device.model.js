const mongoose = require("mongoose");

const deviceSchema = new mongoose.Schema(
  {
    imei: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ["online", "offline"],
    },
    is_deleted: {
      type: Boolean,
      default: false,
    },
    last_packet_received: {
      type: Date,
      default: null,
    },
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // inventory: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "Inventory",
    // },
    // status: {
    //   type: String,
    //   enum: ["Active", "Inactive"],
    //   default: "Active",
    // },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Device", deviceSchema);
