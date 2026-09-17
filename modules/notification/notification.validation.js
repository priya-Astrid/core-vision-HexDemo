const Joi = require("joi");
const mongoose = require("mongoose");

const objectId = (value, helpers) => {
    if (!mongoose.Types.ObjectId.isValid(value)) {
        return helpers.message("Invalid ObjectId");
    }

    return value;
};

exports.createNotificationSchema = Joi.object({

    name: Joi.string()
        .required(),

    description: Joi.string()
        .allow("")
        .optional(),

    /**
     * Availability Period
     */
    availabilityPeriod: Joi.object({

        allDays: Joi.boolean()
            .required(),

        days: Joi.array()
            .items(
                Joi.string().valid(
                    "Monday",
                    "Tuesday",
                    "Wednesday",
                    "Thursday",
                    "Friday",
                    "Saturday",
                    "Sunday"
                )
            )
            .when("allDays", {
                is: true,
                then: Joi.array().max(0), // can be empty
                otherwise: Joi.array().min(1).required() // must not be empty
            })

    }).required(),

    /**
     * Time Duration
     */
    timeDuration: Joi.object({

        anyTime: Joi.boolean()
            .required(),

        from: Joi.string()
            .when("anyTime", {
                is: true,
                then: Joi.optional().allow(""),
                otherwise: Joi.required()
            }),

        to: Joi.string()
            .when("anyTime", {
                is: true,
                then: Joi.optional().allow(""),
                otherwise: Joi.required()
            })

    }).required(),

    /**
     * Conditions
     */
    conditions: Joi.array()
        .items(

            Joi.object({

                field: Joi.string()
                    .required(),

                type: Joi.string()
                    .valid(
                        "integer",
                        "number",
                        "float",
                        "string",
                        "boolean"
                    )
                    .required(),

                operator: Joi.string()
                    .valid(
                        ">",
                        "<",
                        ">=",
                        "<=",
                        "==",
                        "!="
                    )
                    .required(),

                value: Joi.any()
                    .required()
            })

        )
        .min(1)
        .required(),

    /**
     * Message
     */
    message: Joi.string()
        .required(),

    /**
     * Generated fields
     */
    ruleString: Joi.string()
        .optional(),

    messageFields: Joi.array()
        .items(Joi.string())
        .optional(),

    /**
     * Recipients
     */
    recipients: Joi.array()
        .items(

            Joi.object({

                userId: Joi.string()
                    .optional(),

                name: Joi.string()
                    .optional(),

                email: Joi.string()
                    .email()
                    .optional(),

                phoneNumber: Joi.string()
                    .optional(),

                deliveryMethod: Joi.string()
                    .valid(
                        "Email",
                        "SMS"
                    )
                    .required()

            })

        )
        .min(1)
        .required(),

    status: Joi.string()
        .valid(
            "Active",
            "Inactive"
        )
        .required()
});