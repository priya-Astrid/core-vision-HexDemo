module.exports = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      return res.status(400).json({
        success: false,
        errors: error.details.map(err => ({
          message: err.message,
          field: err.path[0]
        }))
      });
    }

    req.body = value; // sanitized data
    next();
  };
};