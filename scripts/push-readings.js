const { ethers } = require("hardhat");

function yyyymmdd(tsMs) {
  const d = new Date(tsMs);
  const y = d.getUTCFullYear();
  const m = `${d.getUTCMonth()+1}`.padStart(2, '0');
  const day = `${d.getUTCDate()}`.padStart(2, '0');
  return Number(`${y}${m}${day}`);
}

const { ensureDeployed } = require('./utils/ensure');
const { getDeployerSigner, getSignerFromPrivateKeyEnv, getSignerByAddress } = require('./utils/signer');

async function main() {
  const deployed = await ensureDeployed();
  const { crop: cropAddr, registry: registryAddr, accounts } = deployed;
  const deployer = await getDeployerSigner();
  const { oracle } = accounts;

  const regC = await ethers.getContractAt("TBARegistry", registryAddr, deployer);
  const token1 = 1, token2 = 2;
  const tba1 = await regC.predictTBA(cropAddr, token1);
  const tba2 = await regC.predictTBA(cropAddr, token2);

  const tba1C = await ethers.getContractAt("TokenBoundAccount", tba1);
  const tba2C = await ethers.getContractAt("TokenBoundAccount", tba2);

  let oracleSigner = await getSignerByAddress(accounts.oracle);
  if (!oracleSigner) {
    // If local accounts don't include the oracle address, try ORACLE_PRIVATE_KEY
    if (process.env.ORACLE_PRIVATE_KEY) {
      oracleSigner = await getSignerFromPrivateKeyEnv('ORACLE_PRIVATE_KEY', false);
    } else {
      // Fallback to deployer, but ensure the oracle set in TBA matches this signer when creating TBAs
      oracleSigner = deployer;
    }
  }

  const now = Date.now();
  const todayKey = yyyymmdd(now);

  // two readings per TBA
  let tx = await tba1C.connect(oracleSigner).pushReading(todayKey, 2500, 1200); // 25.00C, 12.00%
  await tx.wait();
  tx = await tba1C.connect(oracleSigner).pushReading(todayKey, 2400, 1100);
  await tx.wait();

  tx = await tba2C.connect(oracleSigner).pushReading(todayKey, 2300, 1000);
  await tx.wait();
  tx = await tba2C.connect(oracleSigner).pushReading(todayKey, 2200, 900);
  await tx.wait();

  console.log("Readings pushed for date", todayKey);
}

if (require.main === module) {
  main().then(()=>process.exit(0)).catch((e)=>{ console.error(e); process.exit(1); });
}

module.exports = main;
