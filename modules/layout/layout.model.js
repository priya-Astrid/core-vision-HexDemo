const { default: mongoose } = require("mongoose");

const layoutSchema = new mongoose.Schema(
  {
    layoutId: {
      type: Number,
      required: true,
      unique: true,
    },

    name: {
      type: String,
      required: true,
    },
    source: {
      type: String,
      enum: ["Inventory", "Device", "Telemetry"],
      required: true,
    },
    columns: [
      {
        order: { type: Number, required: true },
        column_name: { type: String, required: true },
        display_name: { type: String},
        type: {
          type: String,
          enum: ["Number", "String", "Date", "Boolean"],
        
        },
      },
    ],
    limit:{
        type: Number,
        default: 10
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
    sorting: {
      column: { type: String, required: true },
      direction: {
        type: String,
        enum: ["asc", "desc"],
        default: "asc",
      },
    },
    user:{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization"
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);
module.exports = mongoose.model("Layout", layoutSchema);
