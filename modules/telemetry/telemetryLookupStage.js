function getTelemetryLookupStages() {
  return [
    {
      $lookup: {
        from: "inventories",
        let: { telemetryVin: "$vin" },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ["$vin", "$$telemetryVin"],
              },
            },
          },
        ],
        as: "inventory",
      },
    },
    {
      $unwind: {
        path: "$inventory",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $addFields: {
        make: "$inventory.make",
        model: "$inventory.model",
        year: "$inventory.year",
      },
    },

    {
      $project: {
        inventory: 0,
      },
    },
    {
      $lookup: {
        from: "devices",
        let: { telemetryImei: "$imei" },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ["$imei", "$$telemetryImei"],
              },
            },
          },
        ],
        as: "device",
      },
    },
    {
      $unwind: {
        path: "$device",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $addFields: {
        deviceStatus: "$device.status",
      },
    },
    {
      $project: {
        device: 0,
      },
    },
  ];
}

module.exports = {
  getTelemetryLookupStages,
};
