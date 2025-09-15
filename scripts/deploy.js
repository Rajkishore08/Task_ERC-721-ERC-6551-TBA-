const { ethers } = require("hardhat");

const state = require('./utils/state');

async function main() {
  const network = await ethers.provider.getNetwork();
  const signers = await ethers.getSigners();
  const deployer = signers[0];
  const adminAddr = process.env.ADMIN || (signers[1] ? signers[1].address : deployer.address);
  const user1Addr = process.env.USER1 || (signers[2] ? signers[2].address : deployer.address);
  const user2Addr = process.env.USER2 || (signers[3] ? signers[3].address : deployer.address);
  const oracleAddr = process.env.ORACLE || (signers[4] ? signers[4].address : deployer.address);

  console.log("Deployer:", deployer.address);
  console.log("Admin:", adminAddr);
  console.log("User1:", user1Addr);
  console.log("User2:", user2Addr);
  console.log("Oracle:", oracleAddr);

  const CropNFT = await ethers.getContractFactory("CropNFT");
  const crop = await CropNFT.deploy("CropNFT", "CROP", "ipfs://base-cid/", deployer.address);
  await crop.waitForDeployment();
  const cropAddr = await crop.getAddress();
  console.log("CropNFT:", cropAddr);

  const TBAImpl = await ethers.getContractFactory("TokenBoundAccount");
  const tbaImpl = await TBAImpl.deploy();
  await tbaImpl.waitForDeployment();
  const tbaImplAddr = await tbaImpl.getAddress();
  console.log("TBA Implementation:", tbaImplAddr);

  const TBARegistry = await ethers.getContractFactory("TBARegistry");
  const registry = await TBARegistry.deploy(await tbaImpl.getAddress());
  await registry.waitForDeployment();
  const registryAddr = await registry.getAddress();
  console.log("TBA Registry:", registryAddr);

  // Grant deployer as minter by default is on; also allow admin as minter if needed
  await (await crop.setMinter(adminAddr, true)).wait();

  const deployed = { chainId: Number(network.chainId), crop: cropAddr, tbaImpl: tbaImplAddr, registry: registryAddr, accounts: { deployer: deployer.address, admin: adminAddr, user1: user1Addr, user2: user2Addr, oracle: oracleAddr } };
  state.save(deployed);
  return deployed;
}

if (require.main === module) {
  main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
}

module.exports = main;
