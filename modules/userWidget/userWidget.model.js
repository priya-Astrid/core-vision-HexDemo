const mongoose = require("mongoose");
const userWidgetSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    widgetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Widget",
      requied: true,
    },
    position: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);
userWidgetSchema.index({ userId: 1, widgetId: 1 }, { unique: true });

module.exports = mongoose.model("UserWidget", userWidgetSchema);
