const Rule = require("./rule.model");
const AppError = require("../../utils/AppError");
const { getRedis } = require("../../config/redis");

exports.createRule = async (data) => {

    const rule = await Rule.create(data);

    // Clear Redis cache
    const redis = getRedis();
    await redis.del(`rules:${data.organization}`);

    return rule;
};


exports.getRules = async ({ organizationId, page, limit, search, status }) => {

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

    const rules = await Rule.find(query)
        .populate("organization")
        .populate("createdBy")
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

    const total = await Rule.countDocuments(query);

    return {
        data: rules,
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
    };
};


exports.getRuleById = async (id, organizationId) => {

    const rule = await Rule.findOne({
        _id: id,
        organization: organizationId
    })
        .populate("organization")
        .populate("createdBy");

    if (!rule) {
        throw new AppError("Rule not found", 404);
    }

    return rule;
};


exports.updateRule = async (id, data, organizationId) => {

    const rule = await Rule.findOneAndUpdate(
        { _id: id, organization: organizationId },
        data,
        { returnDocument: "after" }
    );

    if (!rule) {
        throw new AppError("Rule not found", 404);
    }

    // Clear Redis cache
    const redis = getRedis();
    await redis.del(`rules:${organizationId}`);

    return rule;
};


exports.deleteRule = async (id, organizationId) => {

    const rule = await Rule.findOneAndDelete({
        _id: id,
        organization: organizationId
    });

    if (!rule) {
        throw new AppError("Rule not found", 404);
    }

    // Clear Redis cache
    const redis = getRedis();
    await redis.del(`rules:${organizationId}`);

    return rule;
};


exports.enableRule = async (id, organizationId) => {

    const rule = await Rule.findOneAndUpdate(
        { _id: id, organization: organizationId },
        { status: "Active" },
        { returnDocument: "after" }
    );

    if (!rule) {
        throw new AppError("Rule not found", 404);
    }

    // Clear Redis cache
    const redis = getRedis();
    await redis.del(`rules:${organizationId}`);

    return rule;
};


exports.disableRule = async (id, organizationId) => {

    const rule = await Rule.findOneAndUpdate(
        { _id: id, organization: organizationId },
        { status: "Inactive" },
        { returnDocument: "after" }
    );

    if (!rule) {
        throw new AppError("Rule not found", 404);
    }

    // Clear Redis cache
    const redis = getRedis();
    await redis.del(`rules:${organizationId}`);

    return rule;
};