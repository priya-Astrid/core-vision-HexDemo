const orgService = require("./organization.service");

exports.create = async (req, res, next) => {
  try {
    const org = await orgService.createOrg({
      ...req.body,
      createdBy: res.locals.userId,
    });
    res.status(201).json({ success: true, data: org });
  } catch (error) {
    next(error);
  }
};

exports.getAll = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    const orgs = await orgService.getAllOrgs({ page, limit, search });
    res.json({ success: true, data: orgs });
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const updateData = await orgService.updateOrg(req.params.id, req.body);

    res.status(200).json({
      success: true,
      data: updateData,
    });
  } catch (error) {
    next(error);
  }
};

exports.delete = async (req, res, next) => {
  try {
    await orgService.deleteOrg(req.params.id);
    res.status(200).json({
      success: true,
      message: "Organization deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
