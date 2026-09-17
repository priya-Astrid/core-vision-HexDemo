const AppError = require("../../utils/AppError");
const userWidget = require("../userWidget/userWidget.model");
const Widget = require("../widget/widget.model");
const widgetRepository = require("./dashboard.repository");
const { WIDGET_TYPE } = require("./dashboard.constant");
const { transformWidgetData } = require("./dashboardResponse.dto");
const buildResponse = require("../../utils/responseBuilder");
const { DEFAULT_THRESHOLD } = require("./dashboard.constant");
class DashboardService {
  async _processWidget({
    type,
    repositoryFunc,
    threshold = {},
    extraKey,
    defaultValue,
    page,
    limit,
    organization
  }) {
    try {
      // fetch data form repository
      // const {data, total} = await repositoryFunc(threshold, page, limit);
      const result = await repositoryFunc(threshold, page, limit, organization);

      // transform data
      const transformedData = transformWidgetData(type, result.data, threshold, organization);

      return buildResponse(transformedData, {
        [extraKey]: threshold[extraKey] ?? defaultValue,
        // count: result.total,
        count: result.total,
        ...(result.online !== undefined && {
          online: result.online,
          offline: result.offline,
        }),
        pagination: {
          total: result.total,
          page,
          limit,
        },
      });
    } catch (error) {
      throw new AppError(
        `Error processing widget ${type}: ${error.message}`,
        500,
      );
    }
  }
  async getDashboard(userId) {
    const userWidgets = await userWidget
      .find({ userId, isActive: true })
      .populate({
        path: "widgetId",
        match: {
          status: "Active",
        },
        select: "title alias",
      })
      .sort({ position: 1 })
      .lean();

    const filtered = userWidgets.filter((item) => item.widgetId !== null);
    if (filtered.length === 0) {
      const defaultWidget = await Widget.find({ status: "Active" }).lean();
      const dashboard = defaultWidget.map((w, index) => ({
        widgetId: w._id,
        title: w.title,
        alias: w.alias,
        position: index + 1,
        isActive: true,
      }));
      return { dashboard, totalWidgets: dashboard.length };
    }

    const dashboard = filtered.map((item) => ({
      widgetId: item.widgetId._id,
      title: item.widgetId.title,
      alias: item.widgetId.alias,
      position: item.position,
      isActive: item.isActive,
    }));
    return {
      dashboard,
      totalWidgets: filtered.length,
    };
  }

  async handleWidgetOperation(type, threshold = {}, page, limit, organization) {
    const widgetHandleMap = {
      [WIDGET_TYPE.DISCONNECTED_ASSETS]: () =>
        this._getDisconnectedAssets(threshold, page, limit, organization),
      [WIDGET_TYPE.ASSET_BATTERY]: () =>
        this._getBattery(threshold, page, limit, organization),
      [WIDGET_TYPE.GEOFENCE_VIOLATIONS]: () =>
        this._getGeoFence(threshold, page, limit, organization),
      [WIDGET_TYPE.SPEED_ALERTS]: () =>
        this._getSpeedAlerts(threshold, page, limit, organization),
      [WIDGET_TYPE.RPM_LIMIT_ALERTS]: () =>
        this._getRpmLimitAlert(threshold, page, limit, organization),
      [WIDGET_TYPE.ODOMETER_LIMIT_ALERTS]: () =>
        this._getOdometersAlert(threshold, page, limit, organization),

      [WIDGET_TYPE.LOW_FUEL_ALERTS]: () =>
        this._getLowFuelAlert(threshold, page, limit, organization),
      [WIDGET_TYPE.IDLE_ASSETS_ALERTS]: () =>
        this._getIdleAssetAlert(threshold, page, limit, organization),
    };
    const handle = widgetHandleMap[type];
    if (!handle) {
      throw new AppError(`invalid widget type ${type}`, 400);
    }
    return await handle();
  }
  // private function
  async _getDisconnectedAssets(threshold, page, limit, organization) {
    return this._processWidget({
      type: WIDGET_TYPE.DISCONNECTED_ASSETS,
      repositoryFunc: (threshold, page, limit, organization) =>
        widgetRepository.getDisconnectedAssets(threshold, page, limit, organization),
      threshold,
      extraKey: "disconnect",
      defaultValue: DEFAULT_THRESHOLD.disconnect,
      page,
      limit,
      organization,
    });
  }

  async _getSpeedAlerts(threshold, page, limit, organization) {
    return this._processWidget({
      type: WIDGET_TYPE.SPEED_ALERTS,
      repositoryFunc: (threshold, page, limit, organization) =>
        widgetRepository.getSpeedAlert(threshold, page, limit, organization),
      threshold,
      extraKey: "speedLimit",
      defaultValue: DEFAULT_THRESHOLD.speedLimit,
      page,
      limit,
      organization,
    });
  }
  async _getBattery(threshold, page, limit, organization) {
    return this._processWidget({
      type: WIDGET_TYPE.ASSET_BATTERY,
      repositoryFunc: (threshold, page, limit, organization,) =>
        widgetRepository.getBattery(threshold, page, limit, organization),
      threshold,
      extraKey: "assetBattery",
      defaultValue: DEFAULT_THRESHOLD.assetBattery,
      page,
      limit,
      organization,
    });
  }
  async _getGeoFence(threshold, page, limit, organization) {
    return this._processWidget({
      type: WIDGET_TYPE.GEOFENCE_VIOLATIONS,
      repositoryFunc: (threshold, page, limit, organization) =>
        widgetRepository.getGeoFence(threshold, page, limit, organization),
      threshold,
      extraKey: "geofenceViolations",
      defaultValue: DEFAULT_THRESHOLD.geofenceViolations,
      page,
      limit,
      organization
    });
  }
  async _getLowFuelAlert(threshold, page, limit, organization) {
    return this._processWidget({
      type: WIDGET_TYPE.LOW_FUEL_ALERTS,
      repositoryFunc: (threshold, page, limit, organization) =>
        widgetRepository.getLowFuelAlert(threshold, page, limit, organization),
      threshold,
      extraKey: "fuelMax",
      defaultValue: DEFAULT_THRESHOLD.fuelMax,
      page,
      limit,
      organization
    });
  }
  async _getOdometersAlert(threshold, page, limit, organization) {
    return this._processWidget({
      type: WIDGET_TYPE.ODOMETER_LIMIT_ALERTS,
      repositoryFunc: (threshold, page, limit, organization) =>
        widgetRepository.getOdoMeter(threshold, page, limit, organization),
      threshold,
      extraKey: "odoLimit",
      defaultValue: DEFAULT_THRESHOLD.odoLimit,
      page,
      limit,
      organization
    });
  }
  async _getRpmLimitAlert(threshold, page, limit, organization) {
    return this._processWidget({
      type: WIDGET_TYPE.RPM_LIMIT_ALERTS,
      repositoryFunc: (threshold, page, limit, organization) =>
        widgetRepository.getRpmLimitAlert(threshold, page, limit, organization),
      threshold,
      extraKey: "rpmLimit",
      defaultValue: DEFAULT_THRESHOLD.rpmLimit,
      page,
      limit,
      organization
    });
  }
  async _getIdleAssetAlert(threshold, page, limit, organization) {
    return this._processWidget({
      type: WIDGET_TYPE.IDLE_ASSETS_ALERTS,
      repositoryFunc: (threshold, page, limit, organization) =>
        widgetRepository.getIdleAssetAlert(threshold, page, limit, organization),
      threshold,
      extraKey: "idleMinutes",
      defaultValue: DEFAULT_THRESHOLD.idleMinutes,
      page,
      limit,
      organization
    });
  }
}
module.exports = new DashboardService();
