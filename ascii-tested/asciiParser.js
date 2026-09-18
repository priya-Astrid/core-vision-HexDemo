async function asciiParser(packet) {
  //   const asciiPacket =
  //     "BLE;0820012345;82;1.0.0;20191203;17:00:51;+32.691615;-117.297160;2;";
  console.log("ler", packet);
   const message = packet
    .toString("ascii")
    .trim();
  const fields = message.split(";");
  if (fields[0] !== "BLE") {
    throw new Error("invalid ascii ble header");
  }
  const DEV_ID = fields[1];
  const MODEL = Number(fields[2]);
  const SW_VER = fields[3];
  const DATE = fields[4];
  const TIME = fields[5];

  const LAT = Number(fields[6]);
  const LON = Number(fields[7]);
  const BLE_CNT = Number(fields[8]);

  return {
    success: true,
    data: {
      HDR: "BLE",
      deviceId: DEV_ID,
      model: MODEL,
      softwareVersion: SW_VER,
      date: DATE,
      time: TIME,
      location: {
        latitude: LAT,
        longitude: LON,
      },
      bleCount: BLE_CNT,
    },
  };
}
module.exports = asciiParser;
