const Device = require("./device.model");
const Inventory = require("../inventory/inventory.model");
const Organization = require("../organization/organization.model");

const AppError = require("../../utils/AppError");
exports.createDevice = async (data) => {
  const existing = await Device.findOne({ imei: data.imei, organization: data.organization });
  if (existing) {
    throw new AppError("Device with this IMEI already exists", 409);
  }
  return await Device.create(data);
};

exports.getAllDevice = async ({ page, limit, search, organizationId }) => {
  const skip = (page - 1) * limit;

  let query = {
    organization: organizationId,
  };
  if (search) {
    query.$or = [
      // { status: { $regex: search, $options: "i" } },
      { imei: { $regex: search, $options: "i" } },
    ];
  }

  const devices = await Device.find(query)
    // .populate("inventory", "vin model color make stockNumber ")
    .populate("createdBy", "name deviceModel")
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });
  const total = await Device.countDocuments(query);

  return {
    data: devices,
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
};
exports.getAllOnlineImei = async ({ search, organizationId }) => {
  let query = {
    organization: organizationId,
    status: "online",
  };

  if (search) {
    query.imei = {
      $regex: search,
      $options: "i",
    };
  }

  const device = await Device.find(query).select("imei status _id").lean();
  return device;
};
exports.deviceDataById = async (id) => {
  return await Device.findById(id).populate("organization", "name");
};

exports.updateDevice = async (id, data, user) => {
  let query = {};
  if (user.role === "super_admin") {
    query = { _id: id };
  } else if (user.role === "admin") {
    query = { _id: id, organization: user.orgId };
  } else {
    query = { _id: id, createdBy: user.userId };
  }
  return await Device.findOneAndUpdate(query, data, {
    returnDocument: "after",
    runValidators: true,
  });
};
exports.deleteDevice = async (id, user) => {
  let query = {};
  if (user.role === "super_admin") {
    query = { _id: id };
  } else if (user.role === "admin") {
    query = { _id: id, organization: user.orgId };
  } else {
    query = { _id: id, createdBy: user.userId };
  }
  return await Device.findOneAndDelete(query, { returnDocument: "after" });
};
