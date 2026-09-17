const mongoose = require("mongoose");

const organizationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
    },

    description: {
      type: String,
      trim: true,
    },

    phone: {
      type: String,
    },

    address: {
      state: { type: String },
      city: { type: String },
      street: { type: String },
      zipcode: { type: String },
      country: { type: String },
    },

    logo: {
      type: String, // store URL or file path
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Organization", organizationSchema);
