const AppError = require("../../utils/AppError");
const Widget = require("./widget.model");

exports.createWidget = async (data) => {

  const existingTitle = await Widget.findOne({ title: data.title });
  if (existingTitle) {
    throw new AppError("Title already exists", 409);
  }
  const existingAlias = await Widget.findOne({ alias: data.alias });

  if (existingAlias) {
    throw new AppError("Alias already exists", 409);
  }
  return await Widget.create(data);
};
// exports.widgetStatus = async () => {
//   const widgets = await Widget.find({ status: "Active" });
//   return widgets;
// };
exports.updateWidgetStatus = async (id, status) => {
  return await Widget.findByIdAndUpdate(id, { status }, { returnDocument: "after" });
};
exports.getAllWidgets = async ({ page, limit, search, status }) => {
  const skip = (page - 1) * limit;
  let query = {};
  if (search && search.trim() !== "") {
    query.title = { $regex: search, $options: "i" };
  }
  if(status){
    query.status = status;
  }

  const widget = await Widget.find(query)
    .populate("createdBy", "name")
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });
  const total = await Widget.countDocuments(query);
  return {
    data: widget,
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
};
exports.getWidgetById = async (id) => {
  return await Widget.findById(id);
};
exports.updateWidget = async (id, data) => {
  return await Widget.findByIdAndUpdate(id, data, {
    returnDocument: "after",
  });
};

exports.deleteWidget = async (id) => {
  return await Widget.findByIdAndDelete(id);
};
