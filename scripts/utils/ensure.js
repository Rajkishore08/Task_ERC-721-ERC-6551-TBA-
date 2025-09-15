const { ethers } = require("hardhat");
const state = require('./state');

async function hasCode(addr) {
  if (!addr) return false;
  const code = await ethers.provider.getCode(addr);
  return code && code !== '0x';
}

async function ensureDeployed() {
  const net = await ethers.provider.getNetwork();
  let deployed = state.load();
  const needsRedeploy = async (d) => {
    if (!d) return true;
    if (!d.chainId || Number(d.chainId) !== Number(net.chainId)) return true;
    const okCrop = await hasCode(d.crop);
    const okReg = await hasCode(d.registry);
    const okImpl = await hasCode(d.tbaImpl);
    return !(okCrop && okReg && okImpl);
  };

  if (await needsRedeploy(deployed)) {
    deployed = await require('../deploy')();
  }
  return deployed;
}

module.exports = { ensureDeployed };
