

const WebSocket = require("ws");

const WS_URL          = process.env.WS_URL           || "ws://localhost:3000/ws/telemetry";
console.log("WebSocket URL:", WS_URL);
const CAR_COUNT       = parseInt(process.env.CARS            || "20",  10);
const PACKETS_PER_SEC = parseInt(process.env.PACKETS_PER_SEC || "100", 10);
const TICK_MS         = 100;  // fire every 100ms → 10 ticks/sec
const PER_TICK        = Math.ceil(PACKETS_PER_SEC / (1000 / TICK_MS));


const IMEI_LIST = Array.from({ length: CAR_COUNT }, (_, i) =>
  `35308109013${String(3664 + i).padStart(4, "0")}`
);

const EVENT_TYPES = [
  { eType: 1,  eName: "Heartbeat"  },
  { eType: 2,  eName: "Stop"       },
  { eType: 3,  eName: "Sleep"      },
  { eType: 4,  eName: "Moving"     },
  { eType: 5,  eName: "Pwrconn"    },
  { eType: 6,  eName: "Pwrdisconn" },
  { eType: 7,  eName: "Periodboot" },
  { eType: 8,  eName: "Warmboot"   },
  { eType: 9,  eName: "Coldboot"   },
  { eType: 10, eName: "Gpsacq"     },
];

const FUEL_TYPES = ["petrol", "gas", "diesel"];
const DTC_CODES  = ["P0130", "P0420", "P0300", "P0171", "P0455", "P0741"];


const rndFloat = (min, max, d = 4) =>
  parseFloat((Math.random() * (max - min) + min).toFixed(d));

const rndInt = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const rndFrom = (arr) => arr[Math.floor(Math.random() * arr.length)];

function generatePacket(imei) {
  const event        = rndFrom(EVENT_TYPES);
  const isMoving     = event.eType === 4;
  const isPwrDisconn = event.eType === 6;

  const packet = {
    vin: '5YJSA1S1XEFP32050',
    imei,
    deviceData: {
      location: {
        lat:        rndFloat(22.0, 28.0, 6),
        long:       rndFloat(68.0, 88.0, 6),
        hac:        rndFloat(0.1, 0.5, 2),
        satellites: rndInt(6, 12),
        rssi:       rndInt(-90, -50),
      },
      power: {
        main:    isPwrDisconn ? 0 : rndFloat(11.0, 14.5, 1),
        battery: rndFloat(3.5, 4.2, 1),
      },
      engine: {
        spdKmph:  isMoving ? rndFloat(20, 120, 1) : rndFloat(0, 5, 1),
        rpm:      rndInt(700, 5500),
        odoMeter: rndInt(5000, 200000),
      },
      fuel: {
        type:  rndFrom(FUEL_TYPES),
        level: rndFloat(5, 100, 1),
      },
      temperature: {
        oil: rndFloat(20, 110, 1),
      },
      event,
    },
  };

  // ~10% chance of DTC error
  if (Math.random() < 0.1) {
    packet.canData = { code: rndFrom(DTC_CODES) };
    packet.power   = {
      main:    rndFloat(11.0, 14.5, 1),
      battery: rndFloat(3.5, 4.2, 1),
    };
  }

  return packet;
}

let totalSent   = 0;
let sentThisSec = 0;
let dropped     = 0;

setInterval(() => {
  process.stdout.write(
    `\r📊 Sent: ${totalSent.toLocaleString().padStart(8)} total | ` +
    `${String(sentThisSec).padStart(4)}/sec actual | ` +
    `Target: ${PACKETS_PER_SEC}/sec | ` +
    `Dropped (backpressure): ${dropped}   `
  );
  sentThisSec = 0;
}, 1000);

console.log(`\n🚗 CoreVision High-Throughput Simulator`);
console.log(`   WS Target    : ${WS_URL}`);
console.log(`   Devices      : ${CAR_COUNT} IMEIs`);
console.log(`   Target rate  : ${PACKETS_PER_SEC} packets/sec`);
console.log(`   Tick          : every ${TICK_MS}ms → ${PER_TICK} packets/tick\n`);

const ws = new WebSocket(WS_URL);

ws.on("open", () => {
  console.log("✅ Connected — streaming started\n");

  let imeiIndex = 0;

  setInterval(() => {
    if (ws.readyState !== WebSocket.OPEN) return;

    if (ws.bufferedAmount > 1024 * 1024) {
      dropped += PER_TICK;
      return;
    }

    for (let i = 0; i < PER_TICK; i++) {
      const imei = IMEI_LIST[imeiIndex % CAR_COUNT];
      imeiIndex++;

      ws.send(JSON.stringify(generatePacket(imei)));
      totalSent++;
      sentThisSec++;
    }
  }, TICK_MS);
});

ws.on("message", (raw) => {
  try {
    const msg = JSON.parse(raw.toString());
    if (msg.type === "connected") console.log(`ℹ️  ${msg.message}\n`);
  } catch (_) {}
});

ws.on("error", (err) => console.error("\n❌ WS Error:", err.message));
ws.on("close", (code) => {
  console.log(`\n\n🔌 Disconnected (code: ${code})`);
  console.log(`   Total sent : ${totalSent.toLocaleString()} packets`);
  console.log(`   Dropped    : ${dropped} packets`);
});