const deviceService = require("./device.service");

exports.createDevice = async (req, res, next) => {
  try {
    const device = await deviceService.createDevice({
      ...req.body,
      createdBy: res.locals.userId,
      organization: res.locals.orgId,
    });
    res.status(201).json({
      success: true,
      message: "Device created successfully",
      data: device,
    });
  } catch (error) {
    next(error);
  }
};
exports.getAllDevices = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    const organizationId = res.locals.orgId;
    const getDevice = await deviceService.getAllDevice({
      page,
      limit,
      search,
      organizationId,
    });
    res
      .status(200)
      .json({ success: true, message: "Fetched All Device", ...getDevice });
  } catch (error) {
    next(error);
  }
};

exports.getDeviceById = async (req, res, next) => {
  try {
    const deviceData = await deviceService.deviceDataById(req.params.id);
    res.status(200).json({
      success: true,
      message: "Fetched single device",
      deviceData,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateDevice = async (req, res, next) => {
  try {
    const updateData = await deviceService.updateDevice(
      req.params.id,
      req.body,
      {
        userId: res.locals.userId,
        orgId: res.locals.orgId,
        role: res.locals.role,
      },
    );

    if (!updateData) {
      return res
        .status(404)
        .json({ success: false, message: "Device not found" });
    }
    res.status(200).json({
      success: true,
      message: "updated Device successfully",
      data: updateData,
    });
  } catch (error) {
    next(error);
  }
};
exports.getonlineImei = async (req, res, next) => {
  try {
  const search = req.query.search || "";
   
    const organizationId = res.locals.orgId;

    const data = await deviceService.getAllOnlineImei({
      search,
      organizationId,
    });
    res.status(200).json({
      success: true,
      message: "online device fetched",
      data,
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteDevice = async (req, res, next) => {
  try {
    const deleted = await deviceService.deleteDevice(req.params.id, {
      userId: res.locals.userId,
      oranization: res.locals.orgId,
      role: res.locals.role,
    });
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Device not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Deleted Device Successfully",
    });
  } catch (error) {
    next(error);
  }
};
