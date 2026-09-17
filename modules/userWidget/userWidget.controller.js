const AppError = require("../../utils/AppError");
const userWidgetService = require("./userWidget.service");
exports.createUserWidget = async (req, res, next) => {
  try {
    const widget = await userWidgetService.createUserWidget({
      ...req.body,
      userId: res.locals.userId,
    });
    res.status(201).json({
      success: true,
      message: "User Widget created successfully",
      data: widget,
    });
  } catch (error) {
    next(error);
  }
};

exports.getUserWidget = async (req, res, next) => {
  try {
    const widgets = await userWidgetService.getUserWidgets(res.locals.userId);
    res.status(200).json({
      success: true,
      message: "Get User Widget Data",
      data: widgets,
    });
  } catch (error) {
    next(error);
  }
};
exports.updateWidgetPosition = async (req, res, next) => {
  try {
    const { widgetId } = req.params;
    const position = req.body.position;
    if (typeof position !== "number") {
      throw new AppError("position must be a number", 400);
    }
    const updateUserWidget = await userWidgetService.updateWidgetPosition(
      res.locals.userId,
      widgetId,
      position,
    );
    res.status(200).json({
      success: true,
      message: "Widget Position updated successfully",
      data: updateUserWidget,
    });
  } catch (error) {
    next(error);
  }
};
exports.removeWidget = async (req, res, next) => {
  try {
    await userWidgetService.removeWidget(
      res.locals.userId,
      req.params.widgetId,
    );
    res.status(200).json({
      success: true,
      message: "widget removed successfully",
    });
  } catch (error) {
    next(error);
  }
};
