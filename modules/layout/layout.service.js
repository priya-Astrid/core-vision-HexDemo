const Layout = require("./layout.model");
const { getLayout, buildDynamicLayout } = require("../../utils/layout.utils");
const AppError = require("../../utils/AppError");
const APIFeatures = require("../../utils/apiFeature");
const Inventory = require("../inventory/inventory.model");
const Telemetry = require("../telemetry/telemetry.model");
const Device = require("../device/device.model");
const userLayoutModel = require("../userLayout/userLayout.model");

const telemetryLabelKey = {
  "location.lat": "GPS Latitude",
  "location.long": "GPS Longtitude",
  "location.hac": "GPS Horizontal Accuracy",
  "location.satellites": "GPS No of Satellite in View",
  "location.rssi": "Cellular Received Signal Strength",
  "power.main": "Asset Battery",
  "power.battery": "Device Battery",
  "engine.spdKmph": "Speed",
  "engine.rpm": "RPM",
  "engine.odoMeter": "Odometer",
  "fuel.type": "Fuel Type",
  "fuel.level": "Fuel Level",
  "temperature.oil": "Oil Temperature",
  "canData.code": "Oil Temperature",
};
const commanExcludeFields = [
  "__v",
  "_id",
  "organization",
  "createdAt",
  "updatedAt",
  "createdBy",
  "timestamp",
];
const telemetryExcludeFields = [
  ...commanExcludeFields,
  "vin",
  "imei",
  "organizationId",
  "event.eType",
  "event.eName",
  "receivedAt",
];
const sourceConfig = {
  Inventory: {
    model: Inventory,
    excludeFields: commanExcludeFields,
  },
  Telemetry: {
    model: Telemetry,
    excludeFields: telemetryExcludeFields,
    labelMap: telemetryLabelKey,
  },
  Device: {
    model: Device,
    excludeFields: commanExcludeFields,
  },
};
const generateColumn = (schema, excludeFields, labelMap = {}) => {
  return Object.keys(schema.paths)
    .filter((key) => !excludeFields.includes(key))
    .map((key) => ({
      key,
      label:
        labelMap[key] ||
        key
          .replace(/([A-Z])/g, " $1")
          .replace(/^./, (str) => str.toUpperCase()),
      type: schema.paths[key].instance,
    }));
};

exports.createLayout = async (data) => {
  try {
    const existLayout = await Layout.findOne({
      name: data.name,
      source: data.source,
      organization: data.organization,
    });
    if (existLayout) {
      throw new AppError("Name already exist", 409);
    }
    //  get valid columns for source
    const validColumns = await exports.getColumns(data.source);

    const validColumnName = validColumns.map((col) => col.key);
    //  check columns valid or not
    const invalidColumns = data.columns.filter(
      (col) => !validColumnName.includes(col.column_name),
    );
    if (invalidColumns.length) {
      throw new AppError(
        `Invalid columns: ${invalidColumns.map((col) => col.column_name).join(", ")}`,
        400,
      );
    }
    data.columns = data.columns.map((col) => {
      const schemaCol = validColumns.find(
        (vCol) => vCol.key === col.column_name,
      );
      if (!schemaCol) {
        throw new AppError(`Column schema not found : ${col.column_name}`, 500);
      }
      return {
        order: col.order,
        column_name: col.column_name,
        display_name: schemaCol.label,
        type: schemaCol.type,
      };
    });
    const selectedColumns = data.columns.map((col) => col.column_name);
    if (!selectedColumns.includes(data.sorting?.column)) {
      throw new AppError(
        `Sorting must be one selected column: ${data.sorting?.column}`,
        400,
      );
    }
    if (data.isDefault) {
      await Layout.updateMany(
        {
          source: data.source,
          organization: data.organization,
          user: data.user,
          isDefault: true,
        },
        { $set: { isDefault: false } },
      );
    }
    const lastLayout = await Layout.findOne().sort({ layoutId: -1 });
    data.layoutId = lastLayout ? lastLayout.layoutId + 1 : 1;

    const layoutData = await Layout.create(data);
    // old user default false

   await userLayoutModel.updateMany(
      {
        userId: data.user,
        source: data.source,
        organization: data.organization,
        isDefault: true,
      },
      { $set: { isDefault: false } },
    );

    // new user default true
    const userLayoutData = await userLayoutModel.create({
      userId: data.user,
      layoutId: layoutData._id,
      source: data.source,
      organization: data.organization,
      pagesize: data.limit || 10,
      isDefault: true,
    });

    return layoutData;
  } catch (error) {
    if (error.code === 11000) {
      throw new AppError("Name already exist", 409);
    }
    throw error;
  }
};
exports.getAlllayout = async ({
  page,
  limit,
  search,
  orgId,
  userId,
  source,
}) => {
  const queryString = {
    page: page || 1,
    limit: limit || 20,
    search: search || "",
  };
  const features = new APIFeatures(
    Layout.find({ user: userId, source: source, organization: orgId }),
    queryString,
  ).search(["name", "source"]);

  const total = await features.query.clone().countDocuments();

  features.sort().paginate();
  const layouts = await features.query.lean();

  return {
    layouts,
    total,
    page: Number(page) || 1,
    limit: Number(limit) || 20,
    totalPages: Math.ceil(total / limit),
  };
};

exports.getOneLayout = async (id, orgId) => {
  const layout = await Layout.findOne({ _id: id, organization: orgId }).lean();
  if (!layout) {
    throw new AppError("layout not found", 404);
  }

  return layout;
};
exports.updateLayout = async ({ id, data, orgId }) => {
  const currentLayout = await Layout.findOne({ _id: id, organization: orgId });
  if (!currentLayout) {
    throw new AppError("Layout not found", 404);
  }
  // const existLayoutName = await Layout.findOne({
  // name: data.name,
  // organization: orgId,
  // source: currentLayout.source,
  // });
  // if (existLayoutName) {
  // throw new AppError(
  // `Layout name ${data.name} already exist for source ${currentLayout.source}`,
  // 409,
  // );
  // }
  if (data.columns) {
    const validColumn = await exports.getColumns(currentLayout.source);

    const validColumnName = validColumn.map((col) => col.key);
    const invalidColumns = data.columns.filter(
      (col) => !validColumnName.includes(col.column_name),
    );

    if (invalidColumns.length) {
      throw new AppError(
        `Invalid columns: ${invalidColumns
          .map((col) => col.column_name)
          .join(", ")}`,
        400,
      );
    }
    data.columns = data.columns.map((col) => {
      const schemaCol = validColumn.find(
        (vCol) => vCol.key === col.column_name,
      );
      if (!schemaCol) {
        throw new AppError(`Column schema not found : ${col.column_name}`, 400);
      }

      return {
        order: col.order,
        column_name: col.column_name,
        display_name: schemaCol.label,
        type: schemaCol.type,
      };
    });
  }
  await Layout.updateMany(
    {
      _id: id,
      source: currentLayout.source,
      isDefault: true,
    },
    {
      $set: { isDefault: false },
    },
  );

  const updateLayout = await Layout.findByIdAndUpdate(id, data, {
    returnDocument: "after",
    runValidators: true,
  });
  const source = currentLayout.source;

  // all false
  await userLayoutModel.updateMany(
    {
      source: source,
      isDefault: true,
    },
    { $set: { isDefault: false } },
  );
  // current layoutId ko true karo
  await userLayoutModel.updateOne(
    { layoutId: id, source: source },
    {
      $set: {
        isDefault: true,
        columns: updateLayout.columns,
        pagesize: updateLayout.limit,
      },
    },
  );
  return updateLayout;
};
exports.getInventory = async ({ userId, orgId, page, search }) => {
  const layout = await getLayout({
    userId,
    orgId,
    source: "Inventory",
  });
  // make query build
  const { selectedFields, populates } = buildDynamicLayout(layout);
  let query = Inventory.find({ organization: orgId });

  //  select
  if (selectedFields.length) {
    query = query.select(selectedFields.join(" "));
  }
  // populate
  populates.forEach((p) => {
    query = query.populate(p);
  });
  //sorting
  if (layout.sorting?.column) {
    query = query.sort({
      [layout.sorting.column]: layout.sorting.direction === "asc" ? 1 : -1,
    });
  }
  // limit
  if (layout.limit) {
    query = query.limit(layout.limit);
  }
  const data = await query.lean();
  return data;
};
exports.getColumns = async (source) => {
  const normalizeSource =
    source.charAt(0).toUpperCase() + source.slice(1).toLowerCase();
  const config = sourceConfig[normalizeSource];
  if (!config) {
    throw new AppError("Invalid source", 400);
  }

  return generateColumn(
    config.model.schema,
    config.excludeFields,
    config.labelMap || {},
  );
};

exports.getDefaultLayout = async ({ source, userId, orgId }) => {
  const userLayout = await Layout.findOne({
    source,
    organization: orgId,
    user: userId,
    status: "Active",
  }).lean();
  if (userLayout) return userLayout; //mila to wahi do
  const isDefaultLayout = await Layout.findOne({
    souce,
    organization: orgId,
    isDefault: true,
    status: "Active",
  }).lean();

  if (!isDefaultLayout) {
    throw new AppError(`No Layout for source: ${source}`, 404);
  }
  return isDefaultLayout;
};
exports.deleteLayout = async (id) => {
  const currentLayout = await userLayoutModel.findOne({ layoutId: id });

  const layout = await Layout.findByIdAndDelete(id);
  if (!layout) {
    throw new AppError("layout not found", 404);
  }
  let nextDefaultLayout = null;
  if (currentLayout?.isDefault) {
    nextDefaultLayout = await userLayoutModel
      .findOne({
        userId: currentLayout.userId,
        source: currentLayout.source,
        layoutId: { $ne: id },
      })
      .sort({ createdAt: -1 });
  }
  if (nextDefaultLayout) {
    await userLayoutModel.updateOne(
      {
        _id: nextDefaultLayout._id,
      },
      { $set: { isDefault: true } },
    );
  }
  await userLayoutModel.deleteOne({
    layoutId: id,
  });

  return layout;
};
