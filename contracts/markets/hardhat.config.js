require('@nomicfoundation/hardhat-toolbox');
const path = require('path');
require('dotenv').config({
  path: process.env.CUSTOS_MARKETS_ENV || path.join(__dirname, '.env'),
});

const { subtask } = require('hardhat/config');
const { TASK_COMPILE_SOLIDITY_GET_SOLC_BUILD } = require('hardhat/builtin-tasks/task-names');

subtask(TASK_COMPILE_SOLIDITY_GET_SOLC_BUILD, async (args, _hre, runSuper) => {
  if (args.solcVersion === '0.8.26') {
    return {
      compilerPath: require.resolve('solc/soljson.js'),
      isSolcJs: true,
      version: '0.8.26',
      longVersion: '0.8.26+commit.8a97fa7a',
    };
  }
  return runSuper();
});

const privateKey = (process.env.PRIVATE_KEY || '').trim();
const rpcUrl = process.env.GIWA_RPC_URL || 'https://sepolia-rpc.giwa.io';

module.exports = {
  defaultNetwork: 'hardhat',
  solidity: {
    version: '0.8.26',
    settings: {
      optimizer: { enabled: true, runs: 200 },
      viaIR: true,
    },
  },
  networks: {
    hardhat: {
      chainId: 47805,
      allowUnlimitedContractSize: true,
    },
    local: {
      url: process.env.LOCAL_RPC_URL || 'http://127.0.0.1:7545',
      chainId: 47805,
      accounts: privateKey ? [privateKey] : 'remote',
    },
    giwaSepolia: {
      url: rpcUrl,
      chainId: 91342,
      accounts: privateKey ? [privateKey] : [],
    },
  },
  paths: {
    sources: './contracts',
    tests: './test',
    cache: './cache',
    artifacts: './artifacts',
  },
  mocha: { timeout: 200000 },
};
