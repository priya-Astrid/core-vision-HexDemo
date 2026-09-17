const layoutService = require("./layout.service");
exports.createLayout = async (req, res, next) => {
  try {
    const { name, layoutId, columns, source, sorting, isDefault, limit } =
      req.body;
    const userId = res.locals.userId;
    const orgId = res.locals.orgId;
    const layout = await layoutService.createLayout({
      name,
      source,
      columns,
      sorting,
      isDefault,
      limit,
      user: userId,
      createdBy: userId,
      organization: orgId,
    });
    res.status(201).json({
      success: true,
      message: "Layout created successfully",
      data: layout,
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllLayouts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search;
    const orgId = res.locals.orgId;
    const userId = res.locals.id;
    const source = req.query.source;
    
    const layouts = await layoutService.getAlllayout({
      page,
      limit,
      search,
      orgId,
      userId,
      source,
    });
    res.status(200).json({
      success: true,
      message: "layouts fetched successfully",
      data: layouts,
    });
  } catch (error) {
    next(error);
  }
};

exports.getOneLayout = async (req, res, next) => {
  try {
    const orgId = res.locals.orgId;
    const layout = await layoutService.getOneLayout(req.params.id, orgId);
    res.status(200).json({
      success: true,
      message: "getOneLayout fetched successfully",
      data: layout,
    });
  } catch (error) {
    next(error);
  }
};

exports.getDefaultLayout = async (req, res, next) => {
  try {
    const { source } = req.params;
    const userId = res.locals.userId;
    const orgId = res.locals.orgId;
    const defaultColumn = await layoutService.getDefaultLayout({
      source,
      userId,
      orgId,
    });

    res.status(200).json({
      success: true,
      data: defaultColumn,
    });
  } catch (error) {
    next(error);
  }
};
exports.updateLayout = async (req, res, next) => {
  try {
    const layout = await layoutService.updateLayout({
      id: req.params.id,
      data: req.body,
      orgId: res.locals.orgId,
    });
    res.status(200).json({
      success: true,
      message: "updated Layout successfully",
      data: layout,
    });
  } catch (error) {
    next(error);
  }
};
exports.getInventory = async (req, res, next) => {
  try {
    const userId = res.locals.userId;
    const orgId = res.locals.orgId;
    const page = parseInt(req.query.page) || 1;
    const search = req.query.search;
    const result = await layoutService.getInventory({
      userId,
      orgId,
      page,
      search,
    });
    res.status(200).json({
      success: true,
      message: "fetched data",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
exports.getColumns = async (req, res, next) => {
  try {
    const { source } = req.params;
    const columnLayout = await layoutService.getColumns(source);
     res.status(200).json({
      success: true,
      data: columnLayout,
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteLayout = async (req, res, next) => {
  try {
    const layout = await layoutService.deleteLayout(req.params.id);
    res.status(200).json({
      success: true,
      message: "deleted layout successfully",
    });
  } catch (error) {
    next(error);
  }
};
