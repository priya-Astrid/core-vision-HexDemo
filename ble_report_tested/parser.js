// const simpleHex = require("./rawPacket");

const decodeCoordinate = (buffer, offset) => {
  const raw = buffer.readUInt32BE(offset);
  const isNegative = (raw & 0x80000000) !== 0;

  const value = (raw & 0x7fffffff) / 1000000;

  return isNegative ? -value : value;
};
const decodeDate = (buffer, offset) => {
  const year = buffer.readUInt8(offset);
  const month = buffer.readUInt8(offset + 1);
  const day = buffer.readUInt8(offset + 2);
  return {
    year: 2000 + year,
    month,
    day,
  };
};
const decodeTime = (buffer, offset) => {
  const hour = buffer.readInt8(offset);
  const minute = buffer.readUInt8(offset + 1);
  const second = buffer.readUInt8(offset + 2);
  return {
    hour,
    minute,
    second,
  };
};
const parserResult = (packet) => {
//   const buffer = Buffer.from(simpleHex.replace(/\s/g, ""), "hex");
// if(Buffer.isBuffer(packet)){
//     throw new Error("packet must be a buffer")
// }  
const buffer = packet;
console.log("buffer", buffer)
let offset = 0;

  if (buffer.length < 3) {
    throw new Error("packet is too short");
  }
  const HDR = buffer.readUInt8(offset);
  offset += 1;
  if (HDR !== 0x8b) {
    throw new Error(`invalid header :${HDR}`);
  }
  const PKT_LEN = buffer.readUInt16BE(offset);
  offset += 2;
  const actualZipLength = buffer.length - 3;

  if (PKT_LEN !== actualZipLength) {
    throw new Error(
      `Invalid packet length expexted ${PKT_LEN}, received ${buffer.length}`,
    );
  }
  const DEV_ID = buffer.subarray(offset, offset + 5).toString("hex");
  offset += 5;
  const MODEL = buffer.readUInt8(offset);
  offset += 1;
  const SW_VER = buffer.subarray(offset, offset + 3).toString("hex");
  offset += 3;
  const DATE = decodeDate(buffer, offset);
  offset += 3;
  const TIME = decodeTime(buffer, offset);
  offset += 3;
  const LAT = decodeCoordinate(buffer, offset);
  offset += 4;
  const LON = decodeCoordinate(buffer, offset);
  offset += 4;
  const BLE_CNT = buffer.readUInt8(offset);
  offset += 1;
  const bleDevice = [];
  for (let i = 0; i < BLE_CNT; i++) {
    const BLE_RECORD_SIZE = 14;
    if (offset + BLE_RECORD_SIZE > buffer.length) {
      throw new Error(`incomplete ble report at index ${i}`);
    }
    const AVG_RSSI = buffer.readInt8(offset);
    offset += 1;
    const MIN_RSSI = buffer.readInt8(offset);
    offset += 1;
    const MAX_RSSI = buffer.readInt8(offset);
    offset += 1;
    const MAC_ADDR = buffer.subarray(offset, offset + 6).toString("hex");
    offset += 6;
    const SIMPLE_COUNT = buffer.readInt8(offset);
    offset += 1;
    const MAJAR_CODE = buffer.readUInt16BE(offset);
    offset += 2;
    const MINER_CODE = buffer.readUInt16BE(offset);
    offset += 2;

    bleDevice.push({
      macAddress: MAC_ADDR,
      averageRssi: AVG_RSSI,
      minRssi: MIN_RSSI,
      maxRssi: MAX_RSSI,
      sampleCount: SIMPLE_COUNT,
      majorCode: MAJAR_CODE,
      minorCode: MINER_CODE,
    });
  }
  return {
    success: true,
    data: {
      HDR,
      PKT_LEN,
      deviceId: DEV_ID,
      model: MODEL,
      softwareVersion: SW_VER,
      date: `${DATE.year}-${String(DATE.month).padStart(2, "0")}-${String(DATE.day).padStart(2, "0")}`,

      time: `${String(TIME.hour).padStart(2, "0")}:${String(TIME.minute).padStart(2, "0")}:${String(TIME.second).padStart(2, "0")}`,
      location: {
        latitude: LAT,
        longitude: LON,
      },
      bleCount: BLE_CNT,
     bleDevice
    
    },
   
  };
};
module.exports = parserResult;
