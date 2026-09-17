const mongoose = require("mongoose");
const widgetSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      unique: true,
      minlength: 3,
      maxlength: 100,
    },
    alias: {
      type: String,
      unique: true,
    },
    // description: {
    //   type: String,
    //   required: true,
    // },
    status: {
      type: String,
      enum: ["Active", "InActive"],
      default: "Active",
    },
    type:{
      type: String,
      enum: ["SYSTEM","CUSTOM"],
      default: "SYSTEM",
    },
    
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);
// auto create a alias
widgetSchema.pre("save", function () {
  if (!this.alias && this.title) {
    this.alias = this.title
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "_")
      .replace(/[^\w_]/g, "");
  }

});
module.exports = mongoose.model("Widget", widgetSchema);
