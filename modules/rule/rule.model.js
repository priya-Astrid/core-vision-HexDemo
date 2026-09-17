const mongoose = require("mongoose");

const ruleSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },

        alias: {
            type: String,
            trim: true
        },

        description: {
            type: String,
            required: true,
        },

        organization: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Organization",
            required: true,
        },

        field: {
            type: String,
            required: true
        },

        operator: {
            type: String,
            enum: [">", "<", ">=", "<=", "==", "!="],
            required: true
        },

        value: {
            type: Number,
            required: true
        },

        actions: {
            type: [
                {
                    type: String,
                    enum: ["Sms", "Notification", "Email"]
                }
            ],
            default: ["Notification"]
        },

        status: {
            type: String,
            enum: ["Active", "Inactive"],
            default: "Active"
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    },
    { timestamps: true }
);

ruleSchema.pre("save", function () {

  if (!this.alias && this.name) {
    this.alias = this.name
      .toLowerCase()
      .replace(/\s+/g, "_")
      .replace(/[^\w_]/g, "");
  }

});

module.exports = mongoose.model("Rule", ruleSchema);