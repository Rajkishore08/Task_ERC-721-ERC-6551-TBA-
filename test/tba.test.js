const { expect } = require("chai");
const { ethers } = require("hardhat");

function yyyymmdd(tsMs) {
  const d = new Date(tsMs);
  const y = d.getUTCFullYear();
  const m = `${d.getUTCMonth()+1}`.padStart(2, '0');
  const day = `${d.getUTCDate()}`.padStart(2, '0');
  return Number(`${y}${m}${day}`);
}

describe("ERC-721 + TBA", function () {
  it("mints, creates TBA, pushes and reads", async function () {
    const [deployer, admin, user1, oracle] = await ethers.getSigners();

    const CropNFT = await ethers.getContractFactory("CropNFT");
    const crop = await CropNFT.deploy("CropNFT", "CROP", "ipfs://base/", deployer.address);
    await crop.waitForDeployment();

    await (await crop.setMinter(admin.address, true)).wait();
    await (await crop.connect(admin).mint(user1.address)).wait();
    expect(await crop.ownerOf(1)).to.equal(user1.address);

    const TBAImpl = await ethers.getContractFactory("TokenBoundAccount");
    const tbaImpl = await TBAImpl.deploy();
    await tbaImpl.waitForDeployment();

    const TBARegistry = await ethers.getContractFactory("TBARegistry");
    const registry = await TBARegistry.deploy(await tbaImpl.getAddress());
    await registry.waitForDeployment();

    const predicted = await registry.predictTBA(await crop.getAddress(), 1);

    await (await registry.createTBA(await crop.getAddress(), 1, oracle.address, "ipfs://cid1")).wait();

    const tbaC = await ethers.getContractAt("TokenBoundAccount", predicted);

    const todayKey = yyyymmdd(Date.now());
    await (await tbaC.connect(oracle).pushReading(todayKey, 2500, 1200)).wait();
    await (await tbaC.connect(oracle).pushReading(todayKey, 2400, 1100)).wait();

    const [readings, count] = await tbaC.getAllReadings(todayKey);
    expect(Number(count)).to.equal(2);
    expect(Number(readings[0].temperatureC)).to.equal(2500);
  });
});
