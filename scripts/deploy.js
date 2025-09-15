const { ethers } = require("hardhat");

const state = require('./utils/state');
const { getDeployerSigner } = require('./utils/signer');

async function main() {
  const network = await ethers.provider.getNetwork();
    const deployer = await getDeployerSigner();
    const allSigners = await ethers.getSigners().catch(() => []);
    const s1 = allSigners[1]?.address;
    const s2 = allSigners[2]?.address;
    const s3 = allSigners[3]?.address;
    const s4 = allSigners[4]?.address;
    const adminAddr = process.env.ADMIN || s1 || deployer.address;
    const user1Addr = process.env.USER1 || s2 || deployer.address;
    const user2Addr = process.env.USER2 || s3 || deployer.address;
    const oracleAddr = process.env.ORACLE || s4 || deployer.address;

  console.log("Deployer:", deployer.address);
  console.log("Admin:", adminAddr);
  console.log("User1:", user1Addr);
  console.log("User2:", user2Addr);
  console.log("Oracle:", oracleAddr);

    const CropNFT = await ethers.getContractFactory("CropNFT", deployer);
    const crop = await CropNFT.deploy("CropNFT", "CROP", "ipfs://base-cid/", deployer.address);
  await crop.waitForDeployment();
  const cropAddr = await crop.getAddress();
  console.log("CropNFT:", cropAddr);

    const TBAImpl = await ethers.getContractFactory("TokenBoundAccount", deployer);
  const tbaImpl = await TBAImpl.deploy();
  await tbaImpl.waitForDeployment();
  const tbaImplAddr = await tbaImpl.getAddress();
  console.log("TBA Implementation:", tbaImplAddr);

    const TBARegistry = await ethers.getContractFactory("TBARegistry", deployer);
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
