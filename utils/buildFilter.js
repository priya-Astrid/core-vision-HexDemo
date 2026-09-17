const { default: mongoose } = require("mongoose");

const buildFilterQuery = (queryString) => {
  let filter = {};
  Object.keys(queryString).forEach((key) => {
    const val = queryString[key];
    if (
      [
        "page",
        "limit",
        "search",
        "minMiles",
        "maxMiles",
        "minYear",
        "maxYear",
        "sortKey",
        "sortOrder"
      ].includes(key)
    ) {
      return;
    }
    if (typeof val === "string") {
      if (val.includes(",")) {
        filter[key] = {
          $in: val.split(",").map((v) => new RegExp(v.trim(), "i")), // ✅ FIXED
        };
      } else {
        filter[key] = { $regex: val, $options: "i" };
      }
    }
  });
  //searching in make model and vin
  if (queryString.search) {
    filter.$or = [
      { model: { $regex: queryString.search, $options: "i" } },
      { stockNumber: { $regex: queryString.search, $options: "i" } },
      { make: { $regex: queryString.search, $options: "i" } },
      { color: { $regex: queryString.search, $options: "i" } },
      { vin: { $regex: queryString.search, $options: "i" } },
    ];
  }
  // range filter
  if (queryString.minYear || queryString.maxYear) {
    filter.year = {};
    if (queryString.minYear) filter.year.$gte = Number(queryString.minYear);
    if (queryString.maxYear) filter.year.$lte = Number(queryString.maxYear);
  }
  if (queryString.minMiles || queryString.maxMiles) {
    filter.miles = {};
    if (queryString.minMiles) filter.miles.$gte = Number(queryString.minMiles);
    if (queryString.maxMiles) filter.miles.$lte = Number(queryString.maxMiles);
  }
  // return filter;
  let sort = {};

  if (queryString.sortKey || queryString.sortOrder) {
    if (queryString.sortKey) {
      sort[queryString.sortKey] = queryString.sortOrder === "asc" ? 1 : -1;
    }
  }

  return { filter, sort };
};
module.exports = buildFilterQuery;
