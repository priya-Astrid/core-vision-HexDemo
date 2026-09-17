const Joi = require("joi");
const mongoose = require("mongoose");

const objectId = (value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.message("invalid objectId");
  }
  return value;
};
exports.createDeviceSchema = Joi.object({
   imei: Joi.string()
    .pattern(/^[0-9]{15}$/)
    .required()
    .messages({
      "string.pattern.base": "IMEI must be 15 digits",
    }),
 
});

exports.updateDeviceSchema = Joi.object({
 imei: Joi.string()
 .pattern(/^[0-9]{15}$/)
 .messages({
  "string.pattern.base": "IMEI must be 15 digits"
 }).optional(),
 
});

exports.paginationSchema = Joi.object({
  page: Joi.number().integer().optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
  search: Joi.string().allow("").optional(),
});
