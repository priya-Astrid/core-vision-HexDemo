const filterConfig = require("../config/filterConfig");

function buildTelemetryFilter(query = {}) {
  const {
    page,
    limit,
    search,
    sortBy,
    order,
    eType,
    from,
    to,
    idleUnit,
    idleDuration,
  } = query;

  const filter = {};

  const currentPage = Number(page) || 1;
  const perPage = Number(limit) || 20;
  const skip = (currentPage - 1) * perPage;
  // sorting

  const sortField = sortBy || "receivedAt";
  const sortOrder = order === "asc" ? 1 : -1;

  // filter
  if (eType) {
    filter["event.eType"] = eType;
  }

  if (from || to) {
    filter.receivedAt = {};
    if (from) filter.receivedAt.$gte = new Date(from);
    if (to) filter.receivedAt.$lte = new Date(to);
  }
  // helper
  const isValid = (val) => val !== undefined && val !== null && val !== "";
  const toNumber = (val) => {
    const num = Number(val);
    return isNaN(num) ? null : num;
  };

  Object.keys(filterConfig).forEach((key) => {
    const config = filterConfig[key];
    const value = query[key];
    if (isValid(value)) {
      const num = toNumber(value);
      if (num !== null) {
        filter[config.field] = {
          ...(filter[config.field] || {}),
          [config.operator]: num,
        };
      }
    }
  });

  // idle filter
  if (isValid(idleDuration)) {
    const num = toNumber(idleDuration);
    if (num !== null) {
      const unitMs = {
        minutes: num * 60 * 1000,
        hours: num * 60 * 60 * 1000,
        day: num * 24 * 60 * 60 * 1000,
      };
      const ms = unitMs[idleUnit] ?? unitMs.minutes;
      const cutoff = new Date(Date.now() - ms);
      filter["engine.spdKmph"] = {
        ...(filter["engine.spdKmph"] || {}),
        $lte: 1,
      };
      //  merge data filter
      filter["receivedAt"] = {
        ...(filter["receivedAt"] || {}),
        $gte: cutoff,
      };
    }
  }
  // search
  if (search && search.trim() !== "") {
    filter.$or = [
      { "event.eName": { $regex: search, $options: "i" } },
      { imei: { $regex: search, $options: "i" } },
    ];
  }

  // pagination
  return {
    filter,
    pagination: {
      currentPage,
      perPage,
      skip,
    },
    sorting: {
      sortField,
      sortOrder,
    },
  };
}

module.exports = {
  buildTelemetryFilter,
};
