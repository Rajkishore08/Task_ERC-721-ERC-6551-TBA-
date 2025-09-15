const { ethers } = require("hardhat");

const { ensureDeployed } = require('./utils/ensure');

async function main() {
  const deployed = await ensureDeployed();
  const { crop: cropAddr, registry: registryAddr, accounts } = deployed;
  const { user1, user2, oracle } = accounts;

  const cropC = await ethers.getContractAt("CropNFT", cropAddr);
  const regC = await ethers.getContractAt("TBARegistry", registryAddr);

  // Mint two NFTs: batch for user1 and user2
  let tx = await cropC.mint(user1); await tx.wait();
  tx = await cropC.mint(user2); await tx.wait();

  const token1 = 1; const token2 = 2;
  const predicted1 = await regC.predictTBA(cropAddr, token1);
  const predicted2 = await regC.predictTBA(cropAddr, token2);
  console.log("Predicted TBAs:", { token1: predicted1, token2: predicted2 });

  // Create TBAs with sample metadata CIDs (assume already pinned to IPFS)
  const cid1 = "ipfs://QmSampleCID1";
  const cid2 = "ipfs://QmSampleCID2";
  tx = await regC.createTBA(cropAddr, token1, oracle, cid1); await tx.wait();
  tx = await regC.createTBA(cropAddr, token2, oracle, cid2); await tx.wait();

  console.log("Created TBAs:", { token1: await regC.predictTBA(cropAddr, token1), token2: await regC.predictTBA(cropAddr, token2) });
}

if (require.main === module) {
  main().then(() => process.exit(0)).catch((e)=>{ console.error(e); process.exit(1); });
}

module.exports = main;
