const Joi = require("joi");
const mongoose = require("mongoose");

const objectId = (value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.message("Invalid ObjectId");
  }
  return value;
};

exports.createVehicleSchema = Joi.object({
  deviceId: Joi.string().custom(objectId).required(),
  inventoryId: Joi.string().custom(objectId).required(),
  imei: Joi.string()
    .pattern(/^[0-9]{15}$/)
    .required()
    .messages({
      "string.pattern.base": "IMEI must be 15 digits",
    }),
  status: Joi.string().valid("Available", "Assigned", "Damaged"),
});

exports.updateVehicleSchema = Joi.object({
  deviceId: Joi.string().custom(objectId).optional(),
  inventoryId: Joi.string().custom(objectId).optional(),
  status: Joi.string().valid("Available", "Assigned", "Damaged").optional(),
});
