const eventService = require("./event.service");

exports.getEvents = async (req, res, next) => {
  try {
    const page = req.query.page || 1;
    const limit = req.query.limit ||10 ;
      const events = await eventService.getEvent({page, limit});
    res.status(200).json({
      success: true,
      data: events,
    });
  } catch (error) {
    next(error);
  }
};

exports.getByVehicle = async (req, res, next) => {
  try {
    const vehicleData = await eventService.getByVehicle(req.params.vehicleId);
    res.status(200).json({
        success: true,
        data: vehicleData
    })
  } catch (error) {
    next(error);
  }
};
