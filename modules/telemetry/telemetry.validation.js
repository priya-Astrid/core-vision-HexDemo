const Joi = require("joi");

const getByImeiSchema = Joi.object({
  imei: Joi.string().length(15).pattern(/^\d+$/).required().messages({
    "string.length": "IMEI must be exactly 15 digits",
    "string.pattern.base": "IMEI must contain only numbers",
    "any.required": "IMEI is required",
  }),
});

const querySchema = Joi.object({
  page: Joi.number().integer().default(1),
  limit: Joi.number().integer().default(20),
  search: Joi.string().allow("", null),
  speed: Joi.number(),
  lowFuel: Joi.number(),
  rpm: Joi.number(),
  odoMeter: Joi.number(),
  idleDuration: Joi.number(),
  assetBattery: Joi.number(),
  deviceBattery: Joi.number(),
  idleUnit : Joi.string().valid("days", "minutes", "hours"),
  sortBy: Joi.string()
    .valid("receivedAt", "engine.spdKmph", "fuel.level")
    .default("receivedAt"),
  order: Joi.string().valid("asc", "desc").default("desc"),
  eType: Joi.number().integer().min(1).max(10),
  from: Joi.date().iso(),
  to: Joi.date().iso().min(Joi.ref("from")),
});

module.exports = { getByImeiSchema, querySchema };
