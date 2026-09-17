const dashboardService = require("./dashboard.service");
const { WIDGET_TYPE } = require("./dashboard.constant");
const AppError = require("../../utils/AppError");
exports.getDashboard = async (req, res, next) => {
  try {
    const userId = res.locals.userId;
   
    const getDashboard = await dashboardService.getDashboard(userId);
    res.status(200).json({
      success: true,
      message: "data fetched successfully",
      data: getDashboard,
    });
  } catch (error) {
    next(error);
  }
};

exports.handleWidget = async (req, res, next) => {
  try {
    const { type, threshold  } = req.body;
      const page = parseInt(req.query.page )|| 1;
 const limit = parseInt(req.query.limit) || 10;
  const organization = res.locals.orgId;
     if (!type) {
      throw new AppError("Type is required", 400);
    }
    const validTypes = Object.values(WIDGET_TYPE);
    if (!validTypes.includes(type)) {
      throw new AppError(`Invalid Value ${validTypes.join(", ")}`, 422);
    }
    const data = await dashboardService.handleWidgetOperation(type, threshold, page, limit, organization);
    return res.status(200).json({
      success: true,
      message: "Widget data fetched successfully",
      ...data,
    });
  } catch (error) {
    next(error);
  }
};
