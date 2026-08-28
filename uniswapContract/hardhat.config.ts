/**
 * @type import('hardhat/config').HardhatUserConfig
 */
import 'dotenv/config'
import '@nomiclabs/hardhat-ethers'
import { subtask } from 'hardhat/config'
import { TASK_COMPILE_SOLIDITY_GET_SOLC_BUILD } from 'hardhat/builtin-tasks/task-names'

const LOCAL_SOLC: Record<string, { path: string; longVersion: string }> = {
  '0.5.16': {
    path: require.resolve('solc-0.5.16/soljson.js'),
    longVersion: '0.5.16+commit.9c3226ce',
  },
  '0.6.6': {
    path: require.resolve('solc-0.6.6/soljson.js'),
    longVersion: '0.6.6+commit.6c089d02',
  },
  '0.6.12': {
    path: require.resolve('solc-0.6.12/soljson.js'),
    longVersion: '0.6.12+commit.27d51765',
  },
}

subtask(TASK_COMPILE_SOLIDITY_GET_SOLC_BUILD).setAction(async ({ solcVersion }) => {
  const compiler = LOCAL_SOLC[solcVersion]
  if (!compiler) throw new Error('No local Solidity compiler configured for ' + solcVersion)
  return {
    compilerPath: compiler.path,
    isSolcJs: true,
    version: solcVersion,
    longVersion: compiler.longVersion,
  }
})

module.exports = {
  defaultNetwork: 'hardhat',
  networks: {
    hardhat: {
      chainId: 47805,
    },
    local: {
      url: 'http://127.0.0.1:7545',
    },
  },
  solidity: {
    compilers: [
      {
        version: '0.5.16',
        settings: { optimizer: { enabled: true, runs: 200 } },
      },
      {
        version: '0.6.6',
        settings: { optimizer: { enabled: true, runs: 200 } },
      },
      {
        version: '0.6.12',
        settings: { optimizer: { enabled: true, runs: 200 } },
      },
    ],
  },
  mocha: {
    timeout: 200000,
  },
}
