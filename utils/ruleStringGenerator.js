const generateConditionRule = (condition) => {

    const { field, operator, value, type } = condition;

    // Number types
    if (["integer", "number", "float"].includes(type)) {
        return `{${field}} ${operator} ${value}`;
    }

    // String type
    if (type === "string") {

        switch (operator) {

            case "==":
                return `{${field}}.equals("${value}")`;

            case "!=":
                return `!{${field}}.equals("${value}")`;

            case "contains":
                return `{${field}}.contains("${value}")`;

            case "startsWith":
                return `{${field}}.startsWith("${value}")`;

            case "endsWith":
                return `{${field}}.endsWith("${value}")`;

            default:
                return "";
        }
    }

    return "";
};

/**
 * Generate full rule string
 * Example:
 * {speed} > 80 && {status} == "ON"
 */
const generateRuleString = (
    conditions = [],
    conditionsType = "AND"
) => {

    const conditionRules =
        conditions.map(
            generateConditionRule
        );
      
    const joinOperator =
        conditionsType === "OR"
            ? " || "
            : " && ";

    return conditionRules.join(
        joinOperator
    );
};

/**
 * Extract fields from message
 * Example:
 * "Speed is {{speed}}"
 * Output:
 * ["speed"]
 */
const extractMessageFields = (
    message = ""
) => {

    const matches =
        message.match(/{{(.*?)}}/g) || [];

    return matches.map((item) =>
        item
            .replace("{{", "")
            .replace("}}", "")
            .trim()
    );
};

/**
 * Build notification fields
 */
const buildNotificationRules = ({
    conditions = [],
    conditionsType = "AND",
    message = ""
}) => {

    return {
        ruleString: generateRuleString(
            conditions,
            conditionsType
        ),

        messageFields:
            extractMessageFields(message)
    };
};

module.exports = {
    generateConditionRule,
    generateRuleString,
    extractMessageFields,
    buildNotificationRules
};