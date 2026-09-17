const Joi = require("joi");
const mongoose = require("mongoose");

exports.createWidgetSchema = Joi.object({
  title: Joi.string().min(3).required().messages({
    "string.empty": "Title is required",
    "string.min": "Title must be at least 3 characters",
  }),
  // description: Joi.string().trim().min(2).max(500).required(),
  status: Joi.string().valid("Active", "InActive").optional(),
});

exports.updateWidgetSchema = Joi.object({
  title: Joi.string().min(3).optional(),
  // description: Joi.string().min(2).max(500).optional(),
  status: Joi.string().valid("Active", "InActive").optional(),
});
