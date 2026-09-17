function getFieldValue(obj, path) {

  const keys = path.split(".");

  let result = obj;

  for (const key of keys) {

    if (!result) return undefined;

    result = result[key];
  }

  return result;
}

module.exports = getFieldValue;