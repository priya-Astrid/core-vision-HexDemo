const Joi = require("joi");
const mongoose = require("mongoose");

const objectId = (value, helpers) => {
    if (!mongoose.Types.ObjectId.isValid(value)) {
        return helpers.message("Invalid ObjectId");
    }
    return value;
};

const TELEMETRY_FIELDS = [
    "power.battery",
    "power.main",
    "engine.spdKmph",
    "engine.rpm",
    "fuel.level",
    "temperature.oil",
    "event.eType"
];

exports.createRuleSchema = Joi.object({
    name: Joi.string().required(),

    description: Joi.string().optional(),

    organization: Joi.string()
        .custom(objectId)
        .required(),

    field: Joi.string()
        .valid(...TELEMETRY_FIELDS)
        .required(),


    operator: Joi.string()
        .valid(">", "<", ">=", "<=", "==", "!=")
        .required(),

    value: Joi.number().required(),

    actions: Joi.array()
        .items(Joi.string().valid("Sms", "Notification", "Email"))
        .min(1)
        .optional(),

    status: Joi.string()
        .valid("Active", "Inactive")
        .optional()
});