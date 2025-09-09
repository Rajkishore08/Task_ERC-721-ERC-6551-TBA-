const { ethers } = require("hardhat");

function yyyymmdd(tsMs) {
  const d = new Date(tsMs);
  const y = d.getUTCFullYear();
  const m = `${d.getUTCMonth()+1}`.padStart(2, '0');
  const day = `${d.getUTCDate()}`.padStart(2, '0');
  return Number(`${y}${m}${day}`);
}

const state = require('./utils/state');

async function main() {
  let deployed = state.load();
  if (!deployed) deployed = await require("./deploy")();
  const { crop: cropAddr, registry: registryAddr } = deployed;

  const regC = await ethers.getContractAt("TBARegistry", registryAddr);
  const token1 = 1, token2 = 2;
  const tba1 = await regC.predictTBA(cropAddr, token1);
  const tba2 = await regC.predictTBA(cropAddr, token2);

  const tba1C = await ethers.getContractAt("TokenBoundAccount", tba1);
  const tba2C = await ethers.getContractAt("TokenBoundAccount", tba2);

  const todayKey = yyyymmdd(Date.now());

  const [r1, count1] = await tba1C.getAllReadings(todayKey);
  const [r2, count2] = await tba2C.getAllReadings(todayKey);

  function fmt(reading) {
    return {
      timestamp: Number(reading.timestamp),
      temperatureC: Number(reading.temperatureC)/100,
      moisturePct: Number(reading.moisture)/100
    };
  }

  console.log("TBA1 readings (count=", Number(count1), "):", Array.from({length: Number(count1)}, (_,i)=>fmt(r1[i])));
  console.log("TBA2 readings (count=", Number(count2), "):", Array.from({length: Number(count2)}, (_,i)=>fmt(r2[i])));
}

if (require.main === module) {
  main().then(()=>process.exit(0)).catch((e)=>{ console.error(e); process.exit(1); });
}

module.exports = main;
