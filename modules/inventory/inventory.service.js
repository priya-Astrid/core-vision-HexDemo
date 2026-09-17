const { default: mongoose } = require("mongoose");
const APIFeatures = require("../../utils/apiFeature");
const AppError = require("../../utils/AppError");
const { paginatedResponse } = require("../../utils/paginationFormatter");
const Inventory = require("./inventory.model");
const buildFilterQuery = require("../../utils/buildFilter");
const userLayoutService = require("../userLayout/userLayout.service");
const Device = require("../device/device.model");
const auditService = require("../audit/audit.service");
const auditModel = require("../audit/audit.model");
const Telemetry = require("../telemetry/telemetry.model");
const { getAddress } = require("../../services/geocoding.service");
exports.createInventory = async (data) => {
  try {
    const inventory = await Inventory.create(data);

    return inventory;
  } catch (error) {
    if (error.code === 11000) {
      if (error.keyPattern.vin) {
        throw new AppError("VIN already exists", 409);
      }
    }
    throw error;
  }
};
exports.getAllInventory = async ({ queryString }) => {
  const { filter = {}, sort = {} } = buildFilterQuery(queryString);
 const page = Number(queryString.page) || 1;
  const limit = Number(queryString.limit) || 10;
  const skip = (page - 1) * limit;

  // const data = await Inventory.find(filters).sort(sort).skip(skip).limit(limit);
  const data = await Inventory.aggregate([
    { $match: filter },
    { $sort: Object.keys(sort).length ? sort : { createdAt: -1 } },
    { $skip: skip },
    { $limit: limit },
    {
      $lookup: {
        from: Telemetry.collection.name,
        let: { inventoryImei: "$deviceImei" },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ["$imei", "$$inventoryImei"],
              },
            },
          },
        ],
        as: "telemetry",
      },
    },
    {
      $unwind: {
        path: "$telemetry",
        preserveNullAndEmptyArrays: true,
      },
    },
  ]);
  const result = await Promise.all(
    data.map(async (inventory) => {
      const location = inventory.telemetry?.location;
      if (location?.lat && location?.long) {
        const address = await getAddress(location.lat, location.long);
        inventory.location = {
          ...location,
        };
        inventory.address = {
          ...address,
        };
      } else {
        inventory.location = null;
      }
      delete inventory.telemetry;
      return inventory;
    }),
  );

  const total = await Inventory.countDocuments(filter);
  return paginatedResponse({
    data: result,
    page,
    limit,
    total,
  });
};
exports.getInventoryFilters = async ({ queryString }) => {
  const { filter } = await buildFilterQuery(queryString);

  const filters = await Inventory.aggregate([
    { $match: filter },
    {
      $facet: {
        make: [
          {
            $group: {
              _id: "$make",
            },
          },
        ],
        model: [
          {
            $group: {
              _id: "$model",
            },
          },
        ],
        stockNumber: [
          {
            $group: {
              _id: "$stockNumber",
            },
          },
        ],
        vin: [
          {
            $group: {
              _id: "$vin",
            },
          },
        ],
        color: [
          {
            $group: {
              _id: "$color",
            },
          },
        ],
        yearRange: [
          {
            $group: {
              _id: null,
              min: { $min: "$year" },
              max: { $max: "$year" },
            },
          },
        ],
        milesRange: [
          {
            $group: {
              _id: null,
              min: { $min: "$miles" },
              max: { $max: "$miles" },
            },
          },
        ],
      },
    },
  ]);

  const result = filters[0];
  return {
    make: (result.make || []).map((m) => m._id),
    color: (result.color || []).map((c) => c._id),
    vin: (result.vin || []).map((v) => v._id),
    stockNumber: (result.stockNumber || []).map((s) => s._id),
    model: (result.model || []).map((k) => k._id),

    year: result.yearRange[0]
      ? { min: result.yearRange[0].min, max: result.yearRange[0].max }
      : { min: null, max: null },
    miles: result.milesRange[0]
      ? { min: result.milesRange[0].min, max: result.milesRange[0].max }
      : { min: null, max: null },
  };
};
exports.getSingleInventory = async (id, organizationId) => {
  const inventory = await Inventory.findOne({
    _id: id,
    organization: organizationId,
  });
  if (!inventory) {
    throw new AppError("Inventory not found", 404);
  }
  return inventory;
};
exports.updateInventory = async (id, data, organizationId) => {
  const inventory = await Inventory.findOneAndUpdate(
    {
      _id: id,
      // organization: organizationId,
    },
    data,
    { returnDocument: "after" },
  );

  if (!inventory) {
    throw new AppError("Inventory not found", 404);
  }

  return inventory;
};

exports.assignDevice = async (id, data, organization) => {
  const oldInventory = await Inventory.findById(id);
  if (!oldInventory) {
    throw new AppError("Invenotry not found", 404);
  }
 if (data.deviceImei) {
    const existingImei = await Inventory.findOne({
      deviceImei: data.deviceImei,
      _id: { $ne: id },
    });
    if (existingImei) {
      throw new AppError(
        `IMEI already assigned to VIN ${existingImei.vin}`,
        409,
      );
    }
  }

  const inventory = await Inventory.findOneAndUpdate(
    {
      _id: id,
      // organization: organizationId,
    },
    data,
    { returnDocument: "after" },
  );

  if (!inventory) {
    throw new AppError("Inventory not found", 404);
  }

  const imeiChanged =
    Object.prototype.hasOwnProperty.call(data, "deviceImei") &&
    oldInventory.deviceImei !== inventory.deviceImei;

  if (imeiChanged) {
    if (inventory.deviceImei) {
      const payload = {
        vin: inventory.vin,
        imei: inventory.deviceImei,
        organization: inventory.organization
      };
      await auditService.resolveVinAndAudit(payload);
    } else {
      // unassign

      await auditModel.updateOne(
        {
          vin: oldInventory.vin,
          imei: oldInventory.deviceImei,
          organization: oldInventory.organization,
          removedAt: null,
        },
        {
          $set: {
            removedAt: new Date(),
          },
        },
      );
    }
  }

  return inventory;
};
exports.deleteInventory = async (id, organizationId) => {
  const inventory = await Inventory.findOneAndDelete({
    _id: id,
    // organization: organizationId,
  });
  if (!inventory) {
    throw new AppError("inventory not found", 404);
  }

  return inventory;
};
