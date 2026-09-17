const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        alias: {
            type: String,
        },
        description: {
            type: String,
            trim: true
        },

        permissions: [
            {
                type: String
            }
        ],

        isActive: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);
roleSchema.pre("save", function () {
  if (!this.alias && this.name) {
    this.alias = this.name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "_")
      .replace(/[^\w_]/g, "");
  }
});
module.exports = mongoose.model('Role', roleSchema);