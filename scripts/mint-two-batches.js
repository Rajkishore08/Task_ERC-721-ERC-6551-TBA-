const { ethers } = require("hardhat");
const state = require('./utils/state');

async function main() {
  let deployed = state.load();
  if (!deployed) deployed = await require("./deploy")();
  const { crop: cropAddr, registry: registryAddr, accounts } = deployed;
  const { user1, user2, oracle } = accounts;

  const cropC = await ethers.getContractAt("CropNFT", cropAddr);
  const regC = await ethers.getContractAt("TBARegistry", registryAddr);

  let tx = await cropC.mint(user1); await tx.wait();
  tx = await cropC.mint(user2); await tx.wait();

  const token1 = await cropC.callStatic.mint(user1).catch(()=>1); // Not actually minting; just placeholder
  const predicted1 = await regC.predictTBA(cropAddr, 1);
  const predicted2 = await regC.predictTBA(cropAddr, 2);

  console.log("Predicted:", { predicted1, predicted2 });
  await (await regC.createTBA(cropAddr, 1, oracle, "ipfs://QmSampleCID1")).wait();
  await (await regC.createTBA(cropAddr, 2, oracle, "ipfs://QmSampleCID2")).wait();
}

if (require.main === module) {
  main().then(()=>process.exit(0)).catch((e)=>{ console.error(e); process.exit(1); });
}

module.exports = main;
