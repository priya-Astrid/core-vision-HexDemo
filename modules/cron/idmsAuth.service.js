const axios = require("axios");
const logger = require("../../utils/logger");
const dotenv = require("dotenv");
dotenv.config();
let savedToken = null;
const generateToken = async () => {
  try {
    let url =
      `${process.env.IDMS_TOKEN_URL}` +
      `?username=${process.env.IDMSUSERNAME}` +
      `&password=${process.env.IDMSPASSWORD}` +
      `&InstitutionID=${process.env.IDMSINSTITUTIONID}`;
    const response = await axios.get(url);
   
    return response.data;
  } catch (error) {
    logger.error({ message: "error message...", error: error.message });
    return null;
  }
};

const getValidToken = async () => {
  try {
    if (savedToken) {
      logger.info("using saved token");
      return savedToken;
    }
    logger.info("fetching new token");
    const tokenResponse = await generateToken();
    if (
      tokenResponse &&
      Number(tokenResponse.Status) === 200 &&
      tokenResponse.Token
    ) {
      savedToken = tokenResponse.Token;
      logger.info("New token generated and saved");
      return savedToken;
    }
    return null;
  } catch (error) {
    logger.error({ message: "error message...", error: error.message });
  }
};
const clearSavedToken = () => {
  savedToken = null;
};

module.exports = {
  getValidToken,
  clearSavedToken,
};
