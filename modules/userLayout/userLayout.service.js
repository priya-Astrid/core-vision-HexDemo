const AppError = require("../../utils/AppError");
const User = require("../user/user.model");
const userLayout = require("./userLayout.model");
const Layout = require("../layout/layout.model");

exports.getAssignLayout = async (userId, source) => {
  let userLayoutData = await userLayout
    .findOne({ userId, source, isDefault: true })
    .lean();

  let layout = {};
  // if user layout not found , find default layout and create
  if (!userLayoutData) {
    layout = await Layout.findOne({
      isDefault: true,
      source: source,
    }).lean();
    if (!layout) {
      throw new AppError("default layout not found", 404);
    }
  } else {
    layout = await Layout.findById(userLayoutData.layoutId).lean();

    if (!layout) {
      throw new AppError("layout not found", 404);
    }
    let requestedBody = {};
    if (source === "Inventory") {
      requestedBody.InventoryLayout = userLayoutData._id;
    }
    if (source === "Device") {
      requestedBody.DeviceLayout = userLayoutData._id;
    }
    if (source === "Telemetry") {
      requestedBody.TelemetryLayout = userLayoutData._id;
    }
    if (Object.keys(requestedBody).length > 0) {
      await User.findByIdAndUpdate(userId, requestedBody, { returnDocument: "after" });
    }
  }

  return {
    layout,
    visibleColumns: userLayoutData?.columns || layout?.columns || ["name"],
    pagesize: userLayoutData?.pagesize || 10,
  };
};