const Vehicle = require("./vehicle.model");
const AppError = require("../../utils/AppError");
const Inventory = require("../inventory/inventory.model");

exports.createVehicle = async (data) => {
  const vehicle = await Vehicle.create(data);

  return vehicle;
};

exports.getVehicles = async ({ page, limit, search, organizationId }) => {
  const skip = (page - 1) * limit;
  let query = {
    organization: organizationId,
  };

  if (search) {
    query.$or = [
      { model: { $regex: search, $options: "i" } },
      {
        vin: { $regex: search, $options: "i" },
      },
    ];
  }

  const vehicle = await Vehicle.find(query)
    .populate("organization", ("name"))
    .populate("createdBy", ("name"))
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });
  const total = await Vehicle.countDocuments(query);
  return {
    data: vehicle,
    page,
    limit,
    total,
    totalPage: Math.ceil(total / limit),
  };
};

exports.getVehicleById = async (id) => {
  const vehicle = await Vehicle.findById(id)
    .populate("organization")
    .populate("createdBy");

  if (!vehicle) {
    throw new AppError("Vehicle not found", 404);
  }

  return vehicle;
};

exports.updateVehicle = async (id, data) => {
  const vehicle = await Vehicle.findByIdAndUpdate(id, data, { returnDocument: "after" });

  if (!vehicle) {
    throw new AppError("Vehicle not found", 404);
  }

  return vehicle;
};

exports.assignDevice = async (id, imei) => {
  const device = await Vehicle.findOne({ imei });
  if (!device) {
    throw new AppError("Device not found", 404);
  }
  if (device.status !== "Available") {
    throw new AppError("Device already assigned", 400);
  }
  const vehicle = await Vehicle.findById(id);

  if (!vehicle) {
    throw new AppError("vehicle not found", 404);
  }

  vehicle.deviceImei = imei;
  await vehicle.save();

  //   inventory me status change
  device.status = "Assigned";
  await device.save();

  return vehicle;
};
exports.unassign = async (id) => {
  const vehicle = await Vehicle.findById(id);
  if (!vehicle) {
    throw new AppError("Vehicle not found", 404);
  }
  const imei = vehicle.deviceImei;
  if (!imei) {
    throw new AppError("no device assigned this vehicle", 400);
  }
  const inventoryDevice = await Inventory.findOne({ imei });
  if (!inventoryDevice) {
    throw new AppError("inventory device imei not found", 404);
  }
  vehicle.deviceImei = null;
  await vehicle.save();
  // inventory me status available kar do
  inventoryDevice.status = "Available";
  await inventoryDevice.save();
  return vehicle;
};
exports.deleteVehicle = async (id) => {
  const vehicle = await Vehicle.findByIdAndDelete(id);

  if (!vehicle) {
    throw new AppError("Vehicle not found", 404);
  }

  return vehicle;
};
