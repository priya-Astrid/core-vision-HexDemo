const NotificationService = require("./notification.service");

exports.create = async (req, res, next) => {
    try {

        const notification = await NotificationService.createNotification({
            ...req.body,
            organization: res.locals.orgId,
            createdBy: res.locals.userId
        });

        res.status(201).json({
            success: true,
            data: notification
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

        const notifications = await NotificationService.getNotifications({
            organizationId: res.locals.orgId,
            page,
            limit,
            search,
            status
        });

        res.json({
            success: true,
            data: notifications
        });

    } catch (error) {
        next(error);
    }
};

exports.getById = async (req, res, next) => {
    try {

        const notification = await NotificationService.getNotificationById(
            req.params.id,
            req.user.organization
        );

        res.json({
            success: true,
            data: notification
        });

    } catch (error) {
        next(error);
    }
};


exports.update = async (req, res, next) => {
    try {

        const notification = await NotificationService.updateNotification(
            req.params.id,
            req.body,
            res.locals.orgId,
        );

        res.json({
            success: true,
            data: notification
        });

    } catch (error) {
        next(error);
    }
};


exports.delete = async (req, res, next) => {
    try {

        await NotificationService.deleteNotification(
            req.params.id,
            res.locals.orgId,
        );

        res.json({
            success: true,
            message: "Notification deleted successfully"
        });

    } catch (error) {
        next(error);
    }
};