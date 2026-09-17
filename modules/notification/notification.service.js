const Notification = require("./notification.model");
const AppError = require("../../utils/AppError");
const { getRedis } = require("../../config/redis");
const { buildNotificationRules } = require("../../utils/ruleStringGenerator");

exports.createNotification = async (data) => {

    const {
        ruleString,
        messageFields
    } = buildNotificationRules({
        conditions: data.conditions,
        conditionsType: "AND",
        message: data.message
    });

    data.ruleString = ruleString;
    data.messageFields = messageFields;

    const notification =
        await Notification.create(data);

    // Clear Redis cache
    const redis = getRedis();
    await redis.del(`notifications:${data.organization}`);

    // Convert to plain object
    const response =
        notification.toObject();

    // Remove ruleString
    delete response.ruleString;

    return response;
};

exports.getNotifications = async ({ organizationId, page, limit, search, status }) => {

    const skip = (page - 1) * limit;

    let query = {
        organization: organizationId
    };

    if (search && search.trim() !== "") {
        query.name = { $regex: search, $options: "i" };
    }

    if (status) {
        query.status = status;
    }

    const notifications = await Notification.find(query).select("-ruleString -messageFields")
        .populate("organization")
        .populate("createdBy")
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

    const total = await Notification.countDocuments(query);

    return {
        data: notifications,
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
    };
};

exports.getNotificationById = async (id, organizationId) => {

    const notification = await Notification.findOne({
        _id: id,
        organization: organizationId
    }).select("-ruleString -messageFields")
        .populate("organization")
        .populate("createdBy");

    if (!notification) {
        throw new AppError("Notification not found", 404);
    }

    return notification;
};


exports.updateNotification = async (id, data, organizationId) => {

    /**
  * Rebuild ruleString + messageFields
  */
    const {
        ruleString,
        messageFields
    } = buildNotificationRules({
        conditions: data.conditions,
        conditionsType: "AND",
        message: data.message
    });

    data.ruleString = ruleString;
    data.messageFields = messageFields;

    const notification = await Notification.findOneAndUpdate(
        { _id: id, organization: organizationId },
        data,
        { returnDocument: "after" }
    );

    if (!notification) {
        throw new AppError("Notification not found", 404);
    }

    // Clear Redis cache
    const redis = getRedis();
    await redis.del(`notifications:${organizationId}`);

    // Convert to plain object
    const response =
        notification.toObject();

    // Remove ruleString
    delete response.ruleString;

    return response;
};


exports.deleteNotification = async (id, organizationId) => {

    const notification = await Notification.findOneAndDelete({
        _id: id,
        organization: organizationId
    });

    if (!notification) {
        throw new AppError("Notification not found", 404);
    }

    // Clear Redis cache
    const redis = getRedis();
    await redis.del(`notifications:${organizationId}`);

    return notification;
};
