require("dotenv").config();
require("@nomicfoundation/hardhat-toolbox");

const { IOTEX_PRIVATE_KEY, ETHERSCAN_API_KEY } = process.env;

module.exports = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: { enabled: true, runs: 200 }
    }
  },
  networks: {
    hardhat: {},
    // IoTeX Mainnet
    iotex: {
      url: "https://babel-api.mainnet.iotex.io",
      accounts: IOTEX_PRIVATE_KEY ? [IOTEX_PRIVATE_KEY] : [],
      chainId: 4689
    },
    // IoTeX Testnet
    iotex_testnet: {
      url: "https://babel-api.testnet.iotex.io",
      accounts: IOTEX_PRIVATE_KEY ? [IOTEX_PRIVATE_KEY] : [],
      chainId: 4690
    }
  },
  etherscan: {
    // Optional: if using verification via Etherscan-compatible APIs; IoTeX has its own explorer API
    apiKey: ETHERSCAN_API_KEY || ""
  }
};
