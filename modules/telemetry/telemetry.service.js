const Telemetry = require("./telemetry.model");
const logger = require("../../utils/logger");
const TelemetryHistory = require("./telemetryhistory.model");
const { buildTelemetryFilter } = require("../../utils/telemtryFilterQuery");
const {getTelemetryLookupStages} = require("./telemetryLookupStage");
const { default: mongoose } = require("mongoose");
/**
 * Save a single telemetry packet to MongoDB.
 * Called by the RabbitMQ worker.
 */
async function saveTelemetry(payload) {
  try {
    const doc = await Telemetry.create({
      imei: payload.imei,
      location: payload.deviceData?.location || null,
      power: payload.deviceData?.power || null,
      engine: payload.deviceData?.engine || null,
      fuel: payload.deviceData?.fuel || null,
      temperature: payload.deviceData?.temperature || null,
      event: payload.deviceData?.event || null,
      canData: payload.canData || null,
      receivedAt: payload.receivedAt || new Date(),
    });

    logger.info(
      { imei: doc.imei, eType: doc.event?.eType, eName: doc.event?.eName },
      "Telemetry saved to DB",
    );

    return doc;
  } catch (error) {
    logger.error(
      `Failed to save telemetry for IMEI ${payload.imei}: ${error.message}`,
    );
    throw error;
  }
}

/**
 * Get telemetry records for a device with optional filters.
 * @param {string} imei
 * @param {object} options - { limit, eType, from, to }
 */

/**
 * Get the latest single record for a device (current state).
 */
async function getAllTelemetry(query = {}, orgId) {
  const { filter, pagination, sorting } = buildTelemetryFilter(query);
  const { currentPage, perPage, skip } = pagination;
  const { sortField, sortOrder } = sorting;

  filter.organization = new mongoose.Types.ObjectId(orgId);
  const pipeline = [
    {
      $match: filter,
    },
    ...getTelemetryLookupStages(),
    {
      $sort:{
        [sortField]: sortOrder,
      }
    },
    {
      $skip: skip,
    },
    {
      $limit: perPage,
    },
  ];

  const pipelineCount = [
    { $match: filter },
    { $group: { _id: "$imei" } },
    { $count: "total" },
  ];
  const [data, total] = await Promise.all([
    Telemetry.aggregate(pipeline),

    Telemetry.aggregate(pipelineCount),
  ]);
  const totalCount = total[0]?.total || 0;
  return {
    data,
    pagination: {
      total: totalCount,
      page: currentPage,
      limit: perPage,
      totalPages: Math.ceil(totalCount / perPage),
    },
  };
}

/**
 * Get summary stats for a device.
 */
async function getStatsByImei(imei) {
  const result = await Telemetry.aggregate([
    { $match: { imei } },
    {
      $group: {
        _id: "$imei",
        totalRecords: { $sum: 1 },
        avgSpeed: { $avg: "$engine.spdKmph" },
        maxSpeed: { $max: "$engine.spdKmph" },
        avgFuel: { $avg: "$fuel.level" },
        lastSeen: { $max: "$receivedAt" },
        firstSeen: { $min: "$receivedAt" },
      },
    },
  ]);
  return result[0] || null;
}

async function getTelemetryHistory( imei, query = {}, orgId ) {
  const { filter, pagination, sorting } = buildTelemetryFilter(query);
  const { currentPage, perPage, skip } = pagination;
  const { sortField, sortOrder } = sorting;
 
  filter.organization =  new mongoose.Types.ObjectId(orgId);
  if (imei) {
    filter.imei = imei;
  }

  // sorting

  const pipeline = [
    {
      $match: filter,
    },
     ...getTelemetryLookupStages(),
    {
      $sort: {
        [sortField]: sortOrder,
      },
    },
    {
      $skip: skip,
    },
    {
      $limit: perPage,
    },
  ];
  const pipelineCount = [{ $match: filter }, { $count: "total" }];

  const [data, total] = await Promise.all([
    TelemetryHistory.aggregate(pipeline),
    TelemetryHistory.aggregate(pipelineCount),
  ]);
  const totalCount = total[0]?.total || 0;

  return {
    data,
    pagination: {
      total: totalCount,
      page: currentPage,
      limit: perPage,
      totalPages: Math.ceil(totalCount / perPage),
    },
  };
}

module.exports = {
  saveTelemetry,
  getAllTelemetry,
  getStatsByImei,
  getTelemetryHistory,
};