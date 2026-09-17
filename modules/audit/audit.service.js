// run code
const auditModel = require("./audit.model");
const logger = require("../../utils/logger");
const { publishAuditEvent } = require("./audit.publisher");
async function resolveVinAndAudit(payload) {
  try {
    // case 1: vin present in payload
    //   check imei exist in payload

    if (!payload.imei) return payload;
    //   redis key for caching

    if (payload.vin) {
      // trigger audit update event
      await publishAuditEvent({
        imei: payload.imei,
        vin: payload.vin,
        organization: payload.organization
      });
      return payload;
    } else {
      // vin missing but imei present

      const latest = await auditModel
        .findOne({
          imei: payload.imei,
           organization: payload.organization,
          removedAt: null,
        })
        .sort({ assignedAt: -1 });
      if (latest) {
        payload.vin = latest.vin;
      }
    }
  } catch (error) {
    logger.error("Audit failed", error.message);
  }
  return payload;
}
module.exports = {
  resolveVinAndAudit,
};