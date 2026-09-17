const Rule = require("../rule/rule.model");
const { getRedis } = require("../../config/redis");
const evaluateRule = require("../../utils/ruleEvaluator");
const getFieldValue = require("../../utils/getFieldValue");
const { executeRuleActions } = require("./actionExecutor.service");


async function getOrganizationRules(organizationId) {

    const redis = getRedis();
    const cacheKey = `rules:${organizationId}`;

    try {

        // Check Redis
        const cachedRules = await redis.get(cacheKey);

        if (cachedRules) {
            return JSON.parse(cachedRules);
        }

        // Load from MongoDB
        const rules = await Rule.find({
            organization: organizationId,
            status: "Active"
        }).lean();

        // Cache rules for 5 minutes
        await redis.set(cacheKey, JSON.stringify(rules), "EX", 300);

        return rules;

    } catch (err) {

        console.error("Rule cache error:", err.message);

        // fallback to DB
        return Rule.find({
            organization: organizationId,
            status: "Active"
        }).lean();

    }
}

async function evaluateTelemetryRules(telemetry, organizationId) {

    const rules = await getOrganizationRules(organizationId);

    const matchedRules = [];

    for (const rule of rules) {

        const value = getFieldValue(telemetry.deviceData, rule.field);

        if (value === undefined) continue;

        const isMatched = evaluateRule(
            value,
            rule.operator,
            rule.value
        );

        if (isMatched) {
            matchedRules.push(rule);
            await executeRuleActions(rule, telemetry);

        }
    }

    return matchedRules;
}

module.exports = { evaluateTelemetryRules };