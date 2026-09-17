const axios = require("axios");
const logger = require("../utils/logger");
async function getAddress(lat, long) {
  try {
    const response = await axios.get(
      "https://nominatim.openstreetmap.org/reverse",
      {
        params: {
          lat,
          lon: long,
          format: "json",
        },

        headers: {
          "User-Agent": "TelemetryApp/1.0",
        },
      },
    );
   const address = response.data.address;
    const result = {
      town:  address.town || address.village || address.hamlet || null,
      city: address.city || address.city_district,
      district: address.county,
      state: address.state,
      country: address.country,
    };
    return result;
  } catch (error) {
    logger.error("error message:", error.message);
    return null;
  }
}

module.exports = {
  getAddress,
};
