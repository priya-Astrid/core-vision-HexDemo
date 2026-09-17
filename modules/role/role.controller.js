const roleService = require('./role.service');

exports.create = async (req, res, next) => {
  try {
    const role = await roleService.createRole(req.body);
    res.status(201).json({ success: true, data: role });
  } catch (error) {
    next(error);
  }
};

exports.getAll = async (req, res, next) => {
  try {
    const roles = await roleService.getRoles();
    res.json({ success: true, data: roles });
  } catch (error) {
    next(error);
  }
};