const Event = require("./event.model");

exports.createEvent = async (data) => {
  return await Event.create(data);
};
exports.getEvent = async ({ page, limit }) => {
  const skip = (page - 1) * limit;

  return await Event.find().skip(skip).limit(limit).sort({ createdAt: -1 });
};
exports.getByVehicle = async (id) => {
  return await Event.find({ vehicleId: id }).sort({ createdAt: -1 });
};
