const APIFeatures = require("./apiFeature");
const AppError = require("./AppError");

exports.createOne = (Model) => async (req, res, next) => {
  try {
    const document = await Model.create(req.body);
    res.status(201).json({
      success: true,
      message: `${Model.modelName} created successfully`,
      data: document,
    });
  } catch (error) {
    next(error);
  }
};

exports.getAll =
  (Model, populate = null) =>
  async (req, res, next) => {
    try {
      const features = new APIFeatures(Model.find(), req.query)
        .sort()
        .populate();
      const doc = await features.query;
      res.status(200).json({
        success: true,
        message: `${Model.modelName} fetched successfully`,
        data: doc,
      });
    } catch (error) {
      next(error);
    }
  };

exports.getOne =
  (Model, populate = null) =>
  async (req, res, next) => {
    try {
      let doc = await Model.findById(req.params.id).populate(populate);
      res.status(200).json({
        success: true,
        message: `${Model.modelName} fetched successfully`,
        data: doc,
      });
    } catch (error) {
      next(error);
    }
  };
exports.updateOne = (Model) => async (req, res, next) => {
  try {
    const doc = await Model.findByIdAndUpdate(res.locals.userId, req.body, {
      returnDocument: "after",
      runValidators: true,
    });
    if (!doc) {
      throw new AppError(`${Model.moduleName} not found`, 404);
    }
    res.status(200).json({
      success: true,
      message: `${Model.modelName} updated successfully`,
      data: doc,
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteOne = (Model) => async (req, res, next) => {
  try {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) {
      throw new AppError(`${Model.modelName} not found`, 404);
    }
    res.status(200).json({
      success: true,
      message: `${Model.modelName} deleted successfully`,
      data: null,
    });
  } catch (error) {
    next(error);
  }
};
