const userLayoutService = require("./userLayout.service");
const Layout = require("../layout/layout.model");


exports.getAssignedLayout = async (req, res, next) => {
  try {
    const userId = res.locals.userId;
    // const orgId = res.locals.orgId;
    const {source} = req.params;
   const getAssign = await userLayoutService.getAssignLayout(userId, source);
    res.status(200).json({
      success: true,
      message: "fetched assign user successfully",
      data: getAssign,
    });
  } catch (error) {
    next(error);
  }
};
