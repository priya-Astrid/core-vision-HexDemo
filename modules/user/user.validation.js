const Joi = require("joi");
const mongoose = require("mongoose");

const objectId = (value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.message("Invalid ObjectId");
  }
  return value;
};

exports.createUserSchema = Joi.object({
  firstName: Joi.string().trim().min(3).required().messages({
    "string.empty": "First name is required",
    "string.min": "First name must be at least 3 characters",
  }),

  lastName: Joi.string().trim().min(2).optional().allow(""),

  username: Joi.string().trim().min(3).required().messages({
    "string.empty": "Username is required",
    "string.min": "Username must be at least 3 characters",
  }),

  email: Joi.string().trim().email().required().messages({
    "string.email": "Please enter a valid email",
    "string.empty": "Email is required",
  }),

  password: Joi.string().min(6).required().messages({
    "string.min": "Password must be at least 6 characters",
    "string.empty": "Password is required",
  }),
  phoneNumber: Joi.string().optional(),
  

  role: Joi.string().custom(objectId).required(),

  organization: Joi.string().custom(objectId).optional(),

  isActive: Joi.boolean().optional(),
});

exports.updateUserSchema = Joi.object({
  firstName: Joi.string().trim().min(3).optional(),
  lastName: Joi.string().trim().min(2).optional().allow(""),
  username: Joi.string().trim().min(3).optional(),
  email: Joi.string().trim().email().optional(),
  password: Joi.string().min(6).optional(),
  phoneNumber: Joi.string().optional(),
  isActive: Joi.boolean().optional(),
});
