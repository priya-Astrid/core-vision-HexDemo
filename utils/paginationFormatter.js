exports.paginatedResponse = ({ data, page, limit, total, filters }) => {
  return {
    data,
    // filter sirf tab include hoga jab ho
    ...(filters && { filters }),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};