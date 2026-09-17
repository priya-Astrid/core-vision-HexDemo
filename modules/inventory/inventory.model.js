const mongoose = require("mongoose");

const inventorySchema = new mongoose.Schema(
  {
    vin: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    deviceImei: {
      type: String,
      trim: true,
    },
    stockNumber: {
      type: String,
      trim: true,
    },
    year: {
      type: Number,
      trim: true
    },
    make: {
      type: String,
      trim: true,
    },
    color: {
      type: String,
      trim: true,
    },
    miles: {
      type: Number,
      required: true,
      min: 0,
    },

    model: {
      type: String,
      required: true,
    },
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
    },
    // deviceImei:{
    //   type:String,
    // }
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  },
);
inventorySchema.index({
  vin: 1,
  color: 1,
  miles: 1,
  year: 1,
  make: 1,
});
module.exports = mongoose.model("Inventory", inventorySchema);
