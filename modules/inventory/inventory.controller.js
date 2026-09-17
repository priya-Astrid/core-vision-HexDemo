const inventoryService = require("./inventory.service");

exports.createInventory = async (req, res, next) => {
  try {
    const inventoryData = await inventoryService.createInventory({
      ...req.body,
      organization: res.locals.orgId,
      createdBy: res.locals.userId,
    });

    res.status(201).json({
      success: true,
      message: "inventory created successfully",
      data: inventoryData,
    });
  } catch (error) {
    next(error);
  }
};
exports.getAllInventory = async (req, res, next) => {
  try {
    const queryString = req.query;
    // const organizationId = res.locals.orgId;
    const getAllData = await inventoryService.getAllInventory({
      queryString,
    });
    res
      .status(200)
      .json({ success: true, message: "fetched successfully", ...getAllData });
  } catch (error) {
    next(error);
  }
};

exports.getInventoryFilter = async (req, res, next) => {
  try {
    // const orgId = res.locals.orgId;
    const queryString = req.query;
    const filters = await inventoryService.getInventoryFilters({
      queryString,
    });
    res.status(200).json({
      success: true,
      message: "Inventory filters fetched successfully",
      filters,
    });
  } catch (error) {
    next(error);
  }
};
exports.getInventoryById = async (req, res, next) => {
  try {
    const getById = await inventoryService.getSingleInventory(
      req.params.id,
      res.locals.orgId,
    );
    res.status(200).json({
      success: true,
      message: "single inventory fetched successfully",
      getById,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateInventory = async (req, res, next) => {
  try {
    const udpateData = await inventoryService.updateInventory(
      req.params.id,
      req.body,
      res.locals.orgId,
    );
    res.status(200).json({
      success: true,
      message: "inventory updated successfully",
      data: udpateData,
    });
  } catch (error) {
    next(error);
  }
};
// assign and unassign inventory
exports.assignDevice = async (req, res, next) => {
  try {
    const organization = res.locals.orgId;
    const data = await inventoryService.assignDevice(req.params.id, req.body, organization);
    res.status(200).json({
      success: true,
      message: data.deviceImei
        ? "IMEI assigned successfully"
        : "IMEI unassigned successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteInventory = async (req, res, next) => {
  try {
    await inventoryService.deleteInventory(req.params.id, res.locals.orgId);

    res.status(200).json({
      success: true,
      message: "Inventory deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
