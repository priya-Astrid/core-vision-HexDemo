const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },

        description: {
            type: String,
            required: true,
        },

        organization: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Organization",
            required: true,
        },

        availabilityPeriod: {
            allDays: {
                type: Boolean,
                default: false
            },
            days: {
                type: [String],
                enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
            },
        },

        timeDuration: {
            anyTime: {
                type: Boolean,
                default: false
            },
            from: {
                type: String,
            },
            to: {
                type: String,
            }
        },
        // conditionsType: {
        //     type: String,
        //     enum: ["AND", "OR"],
        //     default: "AND"
        // },
        conditions: [{
            field: {
                type: String,
                required: true
            },
            type: {
                type: String,
                required: true
            },
            operator: {
                type: String,
                enum: [">", "<", ">=", "<=", "==", "!="],
                required: true
            },
            value: {
                type: mongoose.Schema.Types.Mixed, // allows any type
                required: true
            }
        }],
        message: {
            type: String,
            required: true
        },
        ruleString: { type: String },
        //dynamic fields to map the keys in the message
        messageFields: [{
            type: String
        }],
        recipients: [{
            userId: { type: String },
            name: { type: String },
            email: { type: String },
            phoneNumber: { type: String },
            deliveryMethod: {
                type: String,
                enum: ["Email", "SMS"]
            }
        }],

        status: {
            type: String,
            enum: ["Active", "Inactive"],
            default: "Active"
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);