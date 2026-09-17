const AppError = require("../utils/AppError");
const Role = require("../modules/role/role.model");

exports.resolveRole = async (req, res, next) => {
  try {
    if (req.body.role) {
      const role = await Role.findOne({
        alias: req.body.role.toLowerCase().trim(),
      });

      if (!role) {
        throw new AppError("Invalid role", 404);
      }
      req.body.role = role._id.toString();
    }
    next();
  } catch (error) {
    next(error);
  }
};
