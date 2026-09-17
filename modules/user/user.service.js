const User = require("./user.model");
const AppError = require("../../utils/AppError");
const bcrypt = require("bcryptjs");

exports.createUser = async (data) => {
  const existingEmail = await User.findOne({ email: data.email });
  if (existingEmail) {
    throw new AppError("Email already exists", 409);
  }
  const user = await User.create(data);
  return user;
};

exports.getAllUsers = async ({ page, limit, search, orgId, role }) => {
  const skip = (page - 1) * limit;
  let query = {};
  if (role !== "super_admin") {
    query.organization = orgId;
  }
  if (search) {
    const regex = new RegExp(search, "i");
    query.$or = [
      { firstName: regex },
      { lastName: regex },
      { username: regex },
    ];
  }
  const user = await User.find(query)
    .populate("role", "name")
    .populate("organization","name")
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  const total = await User.countDocuments(query);
  return {
    data: user,
    page,
    limit,
    total,
    totalPage: Math.ceil(total / limit),
  };
};

exports.getUserById = async (id) => {
  const user = await User.findById(id)
    .populate("role", "name")
    .populate("organization","name");

  if (!user) throw new AppError("User not found", 404);

  return user;
};
exports.updateUser = async (id, data) => {
  if (data.email) {
    const existing = await User.findOne({
      email: data.email,
      _id: { $ne: id },
    });
    if (existing) {
      throw new AppError("Email already exists", 409);
    }
  }
  if (data.password !== undefined) {
    data.password = await bcrypt.hash(data.password, 10);
  }

  const user = await User.findByIdAndUpdate(id, data, {
    returnDocument: "after",
    runValidators: true,
  });
  return user;
};

exports.deleteUser = async (id) => {
  const user = await User.findByIdAndDelete(id);
  if (!user) {
    throw new AppError("User not found", 404);
  }

  return user;
};
