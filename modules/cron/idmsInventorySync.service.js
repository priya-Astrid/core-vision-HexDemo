const axios = require("axios");
const logger = require("../../utils/logger");
const Inventory = require("../inventory/inventory.model");
const { getValidToken, clearSavedToken } = require("./idmsAuth.service");

const dotenv = require("dotenv");
dotenv.config();

exports.getInventory = async () => {
  try {
    // get Token
    const token = await getValidToken();
    if (!token) {
      logger.error("token not found");
      return;
    }
   
    let page = 1;
    let finished = false;
    const layout = "2006086";
    const status = "A";

    const allInventoryData = [];
    while (!finished) {
      try {
        // create api
        let url =
          `${process.env.IDMS_INVENTORY_URL}` +
          `?token=${token}` +
          `&Status=${status}` +
          `&LayoutId=${layout}` +
          `&PageNumber=${page}`;
        const response = await axios.get(url);

        const apiData = response.data;

        //token expired or invalid
        if (
          Number(apiData.Status) === 401 &&
          apiData.Message &&
          apiData.Message.includes("Invaid Token")
        ) {
          logger.info("Token Expired");
          clearSavedToken();
          token = await getValidToken();
          if (!token) {
            logger.error("unable to regenerate token");
            return;
          }
          logger.info("retrying with new token");
          url =
            `${process.env.IDMS_INVENTORY_URL}` +
            `?token=${token}` +
            `&Status=${status}` +
            `&LayoutId=${layout}` +
            `&PageNumber=${page}`;

          response = await axios.get(url);
          apiData = response.data;
        }
        //  no record found
        if (
          !apiData ||
          Number(apiData.Status) !== 200 ||
          Number(apiData.TotalRecords) <= 0
        ) {
          logger.info("No Record found");
          break;
        }
        //inventory page
        for (let item of apiData.Data) {
          const inventory = item.Row;
          const inventoryPayload = {
            vin: inventory.VIN,
            model: inventory.Model,
            stockNumber: inventory.StockNumber,
            year: Number(inventory.YearModel),
            color: inventory.ExteriorColor || "",
            make: inventory.Make,
            miles: Number(inventory.Mileage),
          };
          allInventoryData.push(inventoryPayload);
        }
        //pagination check
        if (Number(apiData.EndingPage) === Number(apiData.PageNumber)) {
          finished = true;
          logger.info("All page completed");
        } else {
          page++;
        }
      } catch (pageError) {
        logger.error({
          message: `Error on page ${page}`,
          error: pageError.message,
        });
        break;
      }
    }
    // save data
    await Promise.all(
      allInventoryData.map((inventoryItem) => {
        return Inventory.updateOne(
          { vin: inventoryItem.vin },
          { $set: inventoryItem },
          { upsert: true,},
        );
      }),
    );
   
  } catch (error) {
    logger.error({ message: "error message...", error: error.message });
  }
};
