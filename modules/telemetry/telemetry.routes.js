const express = require("express");
const router = express.Router();
const controller = require("./telemetry.controller");
const auth = require("../../middlewares/auth.middleware");

/**
 * All routes protected by JWT auth middleware
 *
 * GET /api/v1/telemetry/:imei         → history with optional filters
 * GET /api/v1/telemetry/:imei/latest  → current state of device
 * GET /api/v1/telemetry/:imei/stats   → aggregated stats
 */
router.get("/", auth, controller.getAllTelemetry);

router.get("/history/:imei", auth, controller.getTelemetryHistoryByImei);

router.get("/:imei/stats", auth, controller.getStats);

module.exports = router;