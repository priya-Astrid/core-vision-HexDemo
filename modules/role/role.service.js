const Role = require('./role.model');
const AppError = require('../../utils/AppError');

exports.createRole = async (data) => {
  return Role.create(data);
};

exports.getRoles = async () => {
  return Role.find();
};