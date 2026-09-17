const jwt = require("jsonwebtoken");
const User = require("../user/user.model");
const Role = require("../role/role.model");
const AppError = require("../../utils/AppError");
const { generateToken } = require("../../utils/generateToken");

exports.registerUser = async (data) => {
  try {
    const existingUser = await User.findOne({ email: data.email });

    if (existingUser) {
      throw new AppError("Email already registered", 409);
    }

    // Assign default role
    const role = await Role.findOne({ alias: "user" });

    const user = await User.create({
      ...data,
      role: data.role ? data.role : role?._id,
    });

    const token = generateToken(user);

    
    return { user, token };
  } catch (error) {
    throw error;
  }
};

exports.loginUser = async ({ email, password }) => {
  try {
    const user = await User.findOne({ email })
      .select("+password")
      .populate("role")
      .populate("organization");

    if (!user) {
      throw new AppError("Invalid credentials", 401);
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      throw new AppError("Invalid credentials", 401);
    }

    const token = generateToken(user);
     user.password = undefined;

    return { user, token };
  } catch (error) {
    throw error;
  }
};
