require('@nomicfoundation/hardhat-toolbox');
require('dotenv').config();

const PRIVATE_KEY =
  process.env.PRIVATE_KEY ||
  '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'; // Default Hardhat account #0
const RPC_URL = process.env.RPC_URL;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: '0.8.26',
  paths: {
    sources: './contracts',
    artifacts: './artifacts',
    tests: './contracts',
  },
  networks: {
    hardhat: {
      chainId: 31337,
    },
    localhost: {
      url: 'http://127.0.0.1:8545/',
      chainId: 31337,
    },
    sepolia: {
      url: RPC_URL || '',
      accounts: [PRIVATE_KEY],
      chainId: 11155111,
    },
  },
  mocha: {
    timeout: 40000,
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: 'USD',
  },
  typechain: {
    outDir: 'typechain-types',
    target: 'ethers-v6',
  },
  tsconfig: 'contracts/tsconfig.hardhat.json',
};
