const mongoose = require("mongoose");
const dotenv = require("dotenv");
const logger = require("../utils/logger");
process.env.NODE_ENV
  ? dotenv.config({ path: `./config.env.${process.env.NODE_ENV.trim()}` })
  : dotenv.config({ path: "./config.env" });

const { DATABASE, DATABASE_NAME } = process.env;

// connect the database
mongoose.set("strictQuery", true);
mongoose.set("strictPopulate", false);
mongoose.Promise = global.Promise;
mongoose
  .connect(DATABASE, {
    dbName: DATABASE_NAME,
  })
  .then((con) => {
    logger.info("DB connected Successfully!");
    initDatabase();
  })
  .catch((err) => {
    logger.error("DB connection error:", err);
    process.exit(1); // Exit the process with failure
  });

const connection = mongoose.connection;

module.exports = connection;

// Add intial DB setup
async function initDatabase() {
  try {
    const Role = require("../modules/role/role.model");
    const User = require("../modules/user/user.model");
    const Layout = require("../modules/layout/layout.model");
    const rolesToCreate = [
      {
        name: "Super Admin",
        alias: "super_admin",
        description: "Full access to the entire system.",
      },
      {
        name: "Admin",
        alias: "admin",
        description: "Admin for a specific organization.",
      },
    ];

    // Seed roles
    for (const roleData of rolesToCreate) {
      const existing = await Role.findOne({ alias: roleData.alias });
      if (!existing) {
        await Role.create({ ...roleData, status: "ACTIVE" });
      }
    }

    // Get Super Admin role
    const superAdminRole = await Role.findOne({ alias: "super_admin" });
    if (!superAdminRole) throw new Error("Super Admin role not found");

    const adminEmail = "houstondirectauto@gmail.com";
    let adminUser = await User.findOne({ email: adminEmail });

    if (!adminUser) {
      adminUser = await User.create({
        firstName: "Amin",
        lastName: "Hussain",
        username: "amin",
        email: adminEmail,
        password: "Hda77063!!@",
        role: superAdminRole._id,
      });
    } else {
      if (String(adminUser.role) !== String(superAdminRole._id)) {
        adminUser.role = superAdminRole._id;
        await adminUser.save();
      }
    }
    let layoutCreate = [];

    const defaultLayouts = [
      {
        layoutId: 1,
        name: "Default Inventory Layout",
        source: "Inventory",
        columns: [
          {
            order: 1,
            column_name: "vin",
            display_name: "Vin No",
            type: "String",
          },
          {
            order: 2,
            column_name: "stockNumber",
            display_name: "Stock Number",
            type: "String",
          },
          {
            order: 3,
            column_name: "year",
            display_name: "Year",
            type: "Number",
          },
          {
            order: 4,
            column_name: "make",
            display_name: "Make",
            type: "String",
          },

          {
            order: 5,
            column_name: "model",
            display_name: "Model",
            type: "String",
          },
          {
            order: 6,
            column_name: "miles",
            display_name: "Miles",
            type: "Number",
          },
          {
            order: 7,
            column_name: "color",
            display_name: "Color",
            type: "String",
          },
        ],
        sorting: {
          column: "make",
          direction: "asc",
        },
        isDefault: true,
      },
      {
        layoutId: 2,
        name: "Default Device Layout",
        source: "Device",
        columns: [
          {
            order: 1,
            column_name: "imei",
            display_name: "IMEI",
            type: "String",
          },
          {
            order: 2,
            column_name: "inventory",
            display_name: "Inventory",
            type: "String",
          },
          {
            order: 3,
            column_name: "status",
            display_name: "Status",
            type: "String",
          },
        ],
        sorting: {
          column: "imei",
          direction: "asc",
        },
        isDefault: true,
      },
      {
        layoutId: 3,
        name: "Default Telemetry Layout",
        source: "Telemetry",
        columns: [
          {
            order: 1,
            column_name: "power.main",
            display_name: "Asset Battery",
            type: "Number",
          },
          {
            order: 2,
            column_name: "power.battery",
            display_name: "Device Battery",
            type: "Number",
          },
          {
            order: 3,
            column_name: "location.rssi",
            display_name: "Cellular Received Signal Strength",
            type: "Number",
          },
          {
            order: 4,
            column_name: "location.lat",
            display_name: "GPS Lattitude",
            type: "Number",
          },
          {
            order: 5,
            column_name: "location.long",
            display_name: "GPS Longtitude",
            type: "Number",
          },
          {
            order: 6,
            column_name: "location.hac",
            display_name: "GPS Horizontal Accuracy",
            type: "Number",
          },
          {
            order: 7,
            column_name: "location.satellites",
            display_name: "GPS No of Satellite in View",
            type: "Number",
          },
          {
            order: 8,
            column_name: "engine.spdKmph",
            display_name: "Speed",
            type: "Number",
          },
          {
            order: 9,
            column_name: "engine.rpm",
            display_name: "RPM",
            type: "Number",
          },
          {
            order: 10,
            column_name: "engine.odoMeter",
            display_name: "Odometer",
            type: "Number",
          },
          {
            order: 11,
            column_name: "fuel.type",
            display_name: "Fuel Type",
            type: "String",
          },
          {
            order: 12,
            column_name: "fuel.level",
            display_name: "Fuel Level",
            type: "Number",
          },
          {
            order: 13,
            column_name: "temperature.oil",
            display_name: "Oil Temperature",
            type: "Number",
          },
          {
            order: 14,
            column_name: "canData.code",
            display_name: "Oil Temperature",
            type: "String",
          },
        ],
        sorting: {
          column: "speed",
          direction: "asc",
        },
        isDefault: true,
      },
    ];
    for (const layoutData of defaultLayouts) {
      const layout = await Layout.findOne({
        name: layoutData.name,
        source: layoutData.source,
      });
      if (!layout) {
        layoutCreate.push(layoutData);
      }
    }
    if (layoutCreate.length > 0) {
      await Layout.insertMany(layoutCreate);
      logger.info("Default Layout created for inventory, device and telemetry");
    }

    logger.info(
      "Initial database setup complete with roles, sector, organization, and Super Admin user.",
    );
  } catch (error) {
    logger.error(" Error during database initialization:", error);
  }
}
