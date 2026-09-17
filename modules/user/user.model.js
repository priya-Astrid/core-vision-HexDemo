const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },

    lastName: {
      type: String,
      trim: true,
    },
    username: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false, // ❗ Do not return password by default
    },
    phoneNumber: {
      type: String ,
      trim: true,
      default: null
    },

    role: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role",
    },

    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
    },

    isActive: {
      type: Boolean,
      default: true,
    },
    InventoryLayout: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserLayout",
    },
    DeviceLayout:{
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserLayout"
    },
    TelemetryLayout:{
      type: mongoose.Schema.Types.ObjectId,
      ref:"UserLayout"
    },
    lastLogin: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

// 🔐 Hash password before saving
// userSchema.pre('save', async function (next) {
//   try {
//     if (!this.isModified('password')) return next();

//     this.password = await bcrypt.hash(this.password, 10);
//     next();
//   } catch (error) {
//     next(error);
//   }
// });

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  this.password = await bcrypt.hash(this.password, 10);
});

// 🔐 Compare password method
userSchema.methods.comparePassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
