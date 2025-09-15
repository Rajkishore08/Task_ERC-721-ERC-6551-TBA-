const { ethers } = require("hardhat");

function requireEnv(name, hint) {
  const v = process.env[name];
  if (!v) {
    const h = hint ? ` ${hint}` : '';
    throw new Error(`${name} not set in environment.${h}`);
  }
  return v;
}

async function getDeployerSigner() {
  const signers = await ethers.getSigners();
  if (signers && signers.length > 0) return signers[0];
  const pk = process.env.IOTEX_PRIVATE_KEY;
  if (!pk) throw new Error("No signer available. Set IOTEX_PRIVATE_KEY in .env or configure network accounts.");
  return new (ethers.Wallet)(pk, ethers.provider);
}

async function getSignerFromPrivateKeyEnv(envVar, fallbackToDeployer = true) {
  const pk = process.env[envVar];
  if (pk) return new (ethers.Wallet)(pk, ethers.provider);
  if (fallbackToDeployer) return getDeployerSigner();
  throw new Error(`Missing ${envVar}.`);
}

module.exports = { getDeployerSigner, getSignerFromPrivateKeyEnv, requireEnv };
