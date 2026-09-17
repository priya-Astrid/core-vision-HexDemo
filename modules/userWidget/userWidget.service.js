const AppError = require("../../utils/AppError");
const widgetModel = require("../widget/widget.model");
const userWidget = require("./userWidget.model");

exports.createUserWidget = async (data) => {
  //  first check widget me exist for user or not if exist then throw error
  const widgetExist = await widgetModel.findOne({
    _id: data.widgetId,
    status: "Active",
  });
  if (!widgetExist) {
    throw new AppError("Widget not found or inActive ", 404);
  }
  const exist = await userWidget.findOne({
    userId: data.userId,
    widgetId: data.widgetId,
  });
  if (exist) {
    throw new AppError("widget already added to dashboard", 409);
  }
  const widget = await userWidget.create(data);
  return widget;
};

exports.getUserWidgets = async (userId) => {
  const widgets = await userWidget
    .find({ userId })
    .populate("widgetId")
    .sort({ position: 1 });
  return widgets;
};

exports.updateWidgetPosition = async (userId, widgetId, position) => {
  const userWidgetData = await userWidget.findOne({ userId, widgetId });
  if (!userWidgetData) {
    throw new AppError("user widget not found", 404);
  }
  if (position < 0) {
    throw new AppError("position Invalid", 400);
  }
  const oldPosition = userWidgetData.position;
  if (position > oldPosition) {
    await userWidget.updateMany(
      {
        userId,
        position: { $gt: oldPosition, $lte: position },
      },
      { $inc: { position: -1 } },
    );
  } else {
    await userWidget.updateMany(
      { userId, position: { $gte: position, $lt: oldPosition } },
      { $inc: { position: 1 } },
    );
  }
  userWidgetData.position = position;
  await userWidgetData.save();
  return userWidgetData;
};
exports.removeWidget = async (userId, widgetId) => {
  const widget = await userWidget.findOneAndDelete({ widgetId, userId });
  if (!widget) {
    throw new AppError("Widget not found", 404);
  }
  return widget;
};
