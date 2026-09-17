const Joi = require("joi");
const { model } = require("mongoose");
exports.createInventorySchema = Joi.object({
  vin: Joi.string().required(),
  color: Joi.string().required(),
  year: Joi.number().integer().required(),
  make: Joi.string().required(),
  miles: Joi.number().min(0).required(),
  model: Joi.string().required(),
  stockNumber: Joi.string().required(),
});

exports.updateInventorySchema = Joi.object({
  color: Joi.string().optional(),
  year: Joi.number().integer().optional(),
  make: Joi.string().optional(),
  miles: Joi.number().optional(),
  model: Joi.string().optional(),
  stockNumber: Joi.string().optional(),
  deviceImei: Joi.string().optional(),
});
