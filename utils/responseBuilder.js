const buildResponse = (data, extra = {}) => {
  return {
    ...extra,
     data,
  };
};
module.exports = buildResponse;
