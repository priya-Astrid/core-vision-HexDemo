const mongoose = require("mongoose");

const userLayoutSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    layoutId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Layout",
      required: true,
    },
    source: {
      type: String,
      required: true,
    },
    pagesize: {
      type: Number,
      default: 5,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
    },
  },
  { timestamps: true },
)

module.exports = mongoose.model("userLayout", userLayoutSchema);
