const telemetryService = require("./telemetry.service");
const { getByImeiSchema, querySchema } = require("./telemetry.validation");

exports.getAllTelemetry = async (req, res, next) => {
  try {
    const { error: queryError, value: query } = querySchema.validate(req.query);
    if (queryError) {
      return res
        .status(400)
        .json({ success: false, message: queryError.message });
    }
    const orgId = res.locals.orgId;

    const data = await telemetryService.getAllTelemetry(query, orgId);

    if (!data) {
      return res.status(404).json({
        success: false,
        message: `No telemetry found`,
      });
    }

    res.json({ success: true, ...data });
  } catch (error) {
    next(error);
  }
};

/**
 * Get aggregated stats for a device
 */
exports.getStats = async (req, res, next) => {
  try {
    const { error } = getByImeiSchema.validate({ imei: req.params.imei });
    if (error) {
      return res.status(400).json({ success: false, message: error.message });
    }

    const data = await telemetryService.getStatsByImei(req.params.imei);

    if (!data) {
      return res.status(404).json({
        success: false,
        message: `No stats found for IMEI: ${req.params.imei}`,
      });
    }

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

exports.getTelemetryHistoryByImei = async (req, res, next) => {
  try {
     const { error: queryError, value: query } = querySchema.validate(req.query);
    if (queryError) {
      return res
        .status(400)
        .json({ success: false, message: queryError.message });
    }
  const orgId = res.locals.orgId;

    const data = await telemetryService.getTelemetryHistory(
      req.params.imei,
      query,
      orgId
    );
    res.status(200).json({
      success: true,
      ...data,
    });
  } catch (error) {
    next(error);
  }
};
