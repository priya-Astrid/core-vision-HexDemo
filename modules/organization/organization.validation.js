const Joi = require("joi");

exports.organizationSchema = Joi.object({
  name: Joi.string().trim().min(3).required().messages({
    "string.empty": "name is required",
    "string.min": "name must be at least 3 characters",
  }),
  email: Joi.string().trim().email().optional().messages({
    "string.email": "Please enter a valid email",
    "string.empty": "Email is required",
  }),

  description: Joi.string(),

  phone: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .messages({
      "string.pattern.base": "Phone number must be  10 digits",
      "string.empty": "phone number is required",
    }),

  
  address: Joi.object({
    street: Joi.string().allow(""),
    city: Joi.string().allow(""),
    state: Joi.string().allow(""),
    zipcode: Joi.string().allow(""),
    country: Joi.string().allow(""),
  }).optional(),

  logo: Joi.string().optional(),

  isActive: Joi.boolean().optional(),
});

exports.updateOrgSchema = Joi.object({
  name: Joi.string().trim().min(3).optional(),
  email: Joi.string().trim().email().optional(),

  description: Joi.string().optional(),

  phone: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .optional(),

  address: Joi.object({
    street: Joi.string().allow(""),
    city: Joi.string().allow(""),
    state: Joi.string().allow(""),
    zipcode: Joi.string().allow(""),
    country: Joi.string().allow(""),
  }).optional(),

  logo: Joi.string().optional(),

  isActive: Joi.boolean().optional(),
});
