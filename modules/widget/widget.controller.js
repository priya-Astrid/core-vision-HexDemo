
const widgetService = require("./widget.service");

exports.createWidget = async (req, res, next) => {
  try {
  
    const widget = await widgetService.createWidget({
      ...req.body,
      createdBy: res.locals.userId,
    });
    res.status(201).json({
      success: true,
      message: "Widget created successfully",
      data: widget,
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllWidgets = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    const status = req.query.status || "";
    const widgets = await widgetService.getAllWidgets({ page, limit, search, status });
    res.status(200).json({
      success: true,
      message: "Get All Widget Data",
      data: widgets,
    });
  } catch (error) {
    next(error);
  }
};

exports.getWidgetById = async (req, res, next) => {
  try {
    const widgetData = await widgetService.getWidgetById(req.params.id);
    if (!widgetData) {
      return res
        .status(404)
        .json({ success: false, message: "Widget not found" });
    }
    res.status(200).json({
      success: true,
      message: "Fetched Widget successfuly",
      data: widgetData,
    });
  } catch (error) {
    next(error);
  }
};
// exports.widgetStatus = async (req, res, next) => {
//   try {
//     const widget = await widgetService.widgetStatus();
//     res.status(200).json({
//       success: true,
//       message: "Widget avilable status",
//       data: widget,
//     });
//   } catch (error) {
//     next(error);
//   }
// };
exports.updateWidgetStatus = async (req, res, next) => {
  try {
    const widget = await widgetService.updateWidgetStatus(
      req.params.id,
      req.body.status,
    );
    res.status(200).json({
      success: true,
      message: "widget Status updated successfully",
      data: widget,
    });
  } catch (error) {
    next(error);
  }
};
exports.updateWidget = async (req, res, next) => {
  try {
    const widget = await widgetService.updateWidget(req.params.id, req.body);

    res.status(200).json({
      success: true,
      message: "widget updated successfully",
      data: widget,
    });
  } catch (error) {
    next(error);
  }
};
exports.deleteWidget = async (req, res, next) => {
  try {
    await widgetService.deleteWidget(req.params.id);
    res
      .status(200)
      .json({ success: true, message: "Widget deleted successfully" });
  } catch (error) {
    next(error);
  }
};
