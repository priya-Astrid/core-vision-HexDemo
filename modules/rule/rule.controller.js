const ruleService = require("./rule.service");

exports.create = async (req, res, next) => {
    try {

        const rule = await ruleService.createRule({
            ...req.body,
            organization: res.locals.orgId,
            createdBy: res.locals.userId
        });

        res.status(201).json({
            success: true,
            data: rule
        });

    } catch (error) {
        next(error);
    }
};


exports.getAll = async (req, res, next) => {
    try {

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || "";
        const status = req.query.status;

        const rules = await ruleService.getRules({
            organizationId:res.locals.orgId,
            page,
            limit,
            search,
            status
        });

        res.json({
            success: true,
            data: rules
        });

    } catch (error) {
        next(error);
    }
};


exports.getById = async (req, res, next) => {
    try {

        const rule = await ruleService.getRuleById(
            req.params.id,
            req.user.organization
        );

        res.json({
            success: true,
            data: rule
        });

    } catch (error) {
        next(error);
    }
};


exports.update = async (req, res, next) => {
    try {

        const rule = await ruleService.updateRule(
            req.params.id,
            req.body,
            res.locals.orgId,
        );

        res.json({
            success: true,
            data: rule
        });

    } catch (error) {
        next(error);
    }
};


exports.delete = async (req, res, next) => {
    try {

        await ruleService.deleteRule(
            req.params.id,
            res.locals.orgId,
        );

        res.json({
            success: true,
            message: "Rule deleted successfully"
        });

    } catch (error) {
        next(error);
    }
};

exports.enable = async (req, res, next) => {
    try {

        const rule = await ruleService.enableRule(
            req.params.id,
            res.locals.orgId,
        );

        res.json({
            success: true,
            data: rule
        });

    } catch (error) {
        next(error);
    }
};


exports.disable = async (req, res, next) => {
    try {

        const rule = await ruleService.disableRule(
            req.params.id,
            res.locals.orgId,
        );

        res.json({
            success: true,
            data: rule
        });

    } catch (error) {
        next(error);
    }
};