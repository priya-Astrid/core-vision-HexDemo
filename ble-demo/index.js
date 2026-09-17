const parserResult = require("./bleParser");
const indexData = () => {
  try {
    const result = parserResult();
    console.log(result);
  } catch (error) {
    throw error;
  }
};
indexData();
