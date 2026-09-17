const Organization = require("./organization.model");
const AppError = require("../../utils/AppError");

exports.createOrg = async (data) => {
  const existingOrg = await Organization.findOne({ name: data.name });
  if (existingOrg) {
    throw new AppError("name already exists", 409);
  }
  const existEmail = await Organization.findOne({ email: data.email });
  if (existEmail) {
    throw new AppError("Email already exist", 409);
  }
  return Organization.create(data);
};

exports.getAllOrgs = async ({ page, limit, search }) => {
  const skip = (page - 1) * limit;

  let query = {};
  if (search) {
    query.$or = [{ name: { $regex: search, $options: "i" } }];
  }

  const organization = await Organization.find(query)
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });
  const total = await Organization.countDocuments(query);
  return {
    data: organization,
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
};
exports.updateOrg = async (id, data) => {
  if (data.email) {
    const existing = await Organization.findOne({
      email: data.email,
      _id: { $ne: id },
    });
    if (existing) {
      throw new AppError("Email already exists", 409);
    }
  }
  const organization = await Organization.findByIdAndUpdate(id, data, {
    returnDocument: "after",
    runValidators: true,
  });
  if (!organization) {
    throw new AppError("organization not found", 404);
  }
  return organization;
};
exports.deleteOrg = async (id) => {
  const organization = await Organization.findByIdAndDelete(id);
  if (!organization) {
    throw new AppError("organization not found", 404);
  }
  return organization;
};
