//  ye query banane ka function hai worl
//  column array = select + populate me convert
const layoutModel = require("../modules/layout/layout.model");
const AppError = require("./AppError");
const Inventory = require("../modules/inventory/inventory.model");
exports.getLayout = async ({ userId, orgId, source }) => {
  let layout = await layoutModel.findOne({
    user: userId,
    organization: orgId,
    source,
    status: "Active",
  });
  if (!layout) {
    layout = await layoutModel.findOne({
      organization: orgId,
      source,
      isDefault: true,
      status: "Active",
    });
  }
  if (!layout) {
    throw new AppError("No Layout found", 404);
  }
  return layout;
};

exports.buildDynamicLayout = (layout) => {
  const selectedFields = [];
  const populateMap = {};

  // const sortedColumn = layout.columns.sort((a, b) => a.order - b.order);
  const sortedColumn = [...layout.columns].sort((a, b) => a.order - b.order);
  const validField = Object.keys(Inventory.schema.paths);
  sortedColumn.forEach((col) => {
    const name = col.column_name;
    if (!validField.includes(name.split(".")[0])) {
      return;
    }
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      if (!populateMap[parent]) {
        populateMap[parent] = new Set();
      }
      populateMap[parent].add(child);
    } else {
      selectedFields.push(name);
    }
  });
  const populates = Object.keys(populateMap).map((path) => ({
    path,
    select: Array.from(populateMap[path]).join(" "),
  }));
  return { selectedFields, populates };
};
