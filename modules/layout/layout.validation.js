const Joi = require("joi");
exports.createLayoutSchema = Joi.object({
  name: Joi.string().required(),
  source: Joi.string()
    .valid("Inventory", "User", "Telemetry", "Device")
    .required(),
  columns: Joi.array()
    .items(
      Joi.object({
        order: Joi.number().required(),
        column_name: Joi.string().required(),
      }),
    )
    .min(1)
    .required(),
  sorting: Joi.object({
    column: Joi.string().required(),
    direction: Joi.string().valid("asc", "desc").default("asc"),
  }).required(),
  isDefault: Joi.boolean().default(false),
  limit: Joi.number().integer().min(1).max(100).default(10),
});

exports.updateLayoutSchema = Joi.object({
  name: Joi.string().optional(),
  columns: Joi.array()
    .items(
      Joi.object({
        order: Joi.number().required(),
        column_name: Joi.string().required(),
      }),
    )
    .min(1)
    .optional(),
  sorting: Joi.object({
    column: Joi.string().required(),
    direction: Joi.string().valid("asc", "desc").optional(),
  }).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
  isDefault: Joi.boolean().optional(),
});
