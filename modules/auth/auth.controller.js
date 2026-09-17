const authService = require('./auth.service');

exports.register = async (req, res, next) => {
  try {
    const data = await authService.registerUser(req.body);
    res.status(201).json({ success: true, ...data });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const data = await authService.loginUser(req.body);
    res.json({ success: true, ...data });
  } catch (error) {
    next(error);
  }
};