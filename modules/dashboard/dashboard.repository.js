const { OrganizationListInstance } = require("twilio/lib/rest/previewIam/versionless/organization");
const Telemetry = require("../telemetry/telemetry.model");
const {getTelemetryLookupStages } = require("../telemetry/telemetryLookupStage")
const { DEFAULT_THRESHOLD } = require("./dashboard.constant");
const { default: mongoose } = require("mongoose");

class WidgetRepository {
  _paginate(page, limit) {
    const skip = (page - 1) * limit;
    return [{ $skip: skip }, { $limit: limit }];
  }
  async _countDistinct(pipeline) {
    const result = await Telemetry.aggregate([
      ...pipeline,
      { $count: "total" },
    ]);
    return result[0]?.total || 0;
  }
 async _countByStatus(pipeline) {
    const result = await Telemetry.aggregate([
      ...pipeline,
      ...getTelemetryLookupStages(),
      {
        $group: {
          _id: null,
          online: {
            $sum: { $cond: [{ $eq: ["$deviceStatus", "online"] }, 1, 0] },
          },
          total: { $sum: 1 },
        },
      },
    ]);
    const online = result[0]?.online || 0;
    const total = result[0]?.total || 0;
    const offline = total - online;
    return { online, offline };
  }
  _inventoryLookup() {
    return [
      {
        $lookup: {
          from: "inventories",
          localField: "vin",
          foreignField: "vin",
          as: "inventory",
        },
      },
      {
        $unwind: {
          path: "$inventory",
          preserveNullAndEmptyArrays: true,
        },
      },
    ];
  }

  async;

  _buildBaseQuery(threshold, organization) {
    const query = {};
    if (threshold.imei) query.imei = threshold.imei;
    if(organization){
      query.organization= new mongoose.Types.ObjectId(organization);
    }
    return query;
  }

  _buildBasePipeline(query, sortField = { receivedAt: -1 }) {
    return [{ $match: query }, { $sort: sortField }];
  }

  async _execute(basePipeline, page, limit) {
    const [data, total] = await Promise.all([
      Telemetry.aggregate([
        ...basePipeline,
        ...this._inventoryLookup(),
        ...this._paginate(page, limit),
      ]),
      this._countDistinct(basePipeline),
    ]);
    return { data, total };
  }
async getDisconnectedAssets(threshold, page, limit, organization ) {
    const limitdisconnect =
      threshold.disconnect || DEFAULT_THRESHOLD.disconnect;
    const query = {
      ...this._buildBaseQuery(threshold, organization),
      "power.battery": { $lte: limitdisconnect },
    };
    const basePipeline = this._buildBasePipeline(query);

    const [{ data, total }, statusCounts] = await Promise.all([
      this._execute(basePipeline, page, limit),
      this._countByStatus(basePipeline),
    ]);

    return { data, total, ...statusCounts };
  }
  // async getDisconnectedAssets(threshold, page, limit) {
  //   const limitdisconnect =
  //     threshold.disconnect || DEFAULT_THRESHOLD.disconnect;
  //   const query = {
  //     ...this._buildBaseQuery(threshold),
  //     "power.battery": { $lte: limitdisconnect },
  //   };
  //   return this._execute(this._buildBasePipeline(query), page, limit);
  // }
  async getSpeedAlert(threshold, page, limit, organization) {
    const limitSpeed = threshold.speedLimit || DEFAULT_THRESHOLD.speedLimit;
    const query = {
      ...this._buildBaseQuery(threshold, organization),
      "engine.spdKmph": { $gt: limitSpeed },
    };
    return this._execute(this._buildBasePipeline(query), page, limit, organization);
  }
  async getBattery(threshold, page, limit, organization) {
    const LimitBattery =
      threshold.assetBattery || DEFAULT_THRESHOLD.assetBattery;
    const query = {
      ...this._buildBaseQuery(threshold, organization),
      "power.battery": { $lte: LimitBattery },
    };
    return this._execute(this._buildBasePipeline(query), page, limit, organization);
  }
  async getLowFuelAlert(threshold,page, limit, organization) {
    const LimitLowFuel = threshold.fuelMax || DEFAULT_THRESHOLD.fuelMax;
    const query = {
      ...this._buildBaseQuery(threshold, organization),
      "fuel.level": { $lte: LimitLowFuel },
    };
    return this._execute(this._buildBasePipeline(query), page, limit, organization);
  }
  async getGeoFence(threshold, page, limit, organization) {
    const query = {
      ...this._buildBaseQuery(threshold, organization),
      "event.eName": "GeofenceViolation",
    };
    return this._execute(this._buildBasePipeline(query), page, limit, organization);
  }
  async getOdoMeter(threshold, page, limit, organization) {
    const limitOdometer = threshold.odoLimit || DEFAULT_THRESHOLD.odoLimit;
    const query = {
      ...this._buildBaseQuery(threshold,organization),
      "engine.odoMeter": { $gt: limitOdometer },
    };
    return this._execute(this._buildBasePipeline(query), page, limit, organization);
  }
  async getRpmLimitAlert(threshold, page, limit, organization) {
    const limitRpm = threshold.rpmLimit || DEFAULT_THRESHOLD.rpmLimit;
    const query = {
      ...this._buildBaseQuery(threshold,  organization),
      "engine.rpm": { $gt: limitRpm },
    };
    return this._execute(this._buildBasePipeline(query), page, limit, organization);
  }
  async getIdleAssetAlert(threshold, page, limit, organization) {
    const idleMinutes = threshold.idleMinutes || DEFAULT_THRESHOLD.idleMinutes;
    const cutoff = new Date(Date.now() - idleMinutes * 60 * 1000);
    const query = {
      ...this._buildBaseQuery(threshold,  organization),
      "engine.spdKmph": 0,
      receivedAt: { $lt: cutoff },
    };

    return this._execute(this._buildBasePipeline(query), page, limit, organization);
  }
}
module.exports = new WidgetRepository();
