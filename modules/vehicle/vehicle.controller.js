const vehicleService = require("./vehicle.service");

exports.create = async (req, res, next) => {
  try {
    const vehicle = await vehicleService.createVehicle({
      ...req.body,
      createdBy: res.locals.userId,
      organization: res.locals.orgId,
    });

    res.status(201).json({
      success: true,
      data: vehicle,
    });
  } catch (error) {
    next(error);
  }
};

exports.getAll = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    const vehicles = await vehicleService.getVehicles({
      page,
      limit,
      search,
      organizationId: res.locals.orgId,
    });

    res.json({
      success: true,
      data: vehicles,
    });
  } catch (error) {
    next(error);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const vehicle = await vehicleService.getVehicleById(req.params.id);

    res.json({
      success: true,
      data: vehicle,
    });
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const vehicle = await vehicleService.updateVehicle(req.params.id, req.body);

    res.json({
      success: true,
      data: vehicle,
    });
  } catch (error) {
    next(error);
  }
};

exports.assignDevice = async (req, res, next) => {
  try {
    const { imei } = req.body;
    const vehicle = await vehicleService.assignDevice(req.params.id, imei);

    res.status(200).json({
      success: true,
      data: vehicle,
    });
  } catch (error) {
    next(error);
  }
};
// unassigndevice api

exports.unassignDevice = async (req, res, next) => {
  try {
   const vehicle = await vehicleService.unassign(req.params.id);
    res.status(200).json({
      success: true,
      data: vehicle,
    });
  } catch (error) {
    next(error);
  }
};

exports.delete = async (req, res, next) => {
  try {
    await vehicleService.deleteVehicle(req.params.id);

    res.json({
      success: true,
      message: "Vehicle deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
