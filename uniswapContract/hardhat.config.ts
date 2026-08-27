/**
 * @type import('hardhat/config').HardhatUserConfig
 */
import 'dotenv/config';
import 'hardhat-deploy';
import 'hardhat-local-networks-config-plugin';
import '@nomiclabs/hardhat-ethers';
import '@nomiclabs/hardhat-truffle5';
import '@nomiclabs/hardhat-etherscan'
import { subtask } from 'hardhat/config'
import { TASK_COMPILE_SOLIDITY_GET_SOLC_BUILD } from 'hardhat/builtin-tasks/task-names'

const LOCAL_SOLC: Record<string, { path: string; longVersion: string }> = {
  '0.5.16': {
    path: require.resolve('solc-0.5.16/soljson.js'),
    longVersion: '0.5.16+commit.9c3226ce'
  },
  '0.6.6': {
    path: require.resolve('solc-0.6.6/soljson.js'),
    longVersion: '0.6.6+commit.6c089d02'
  },
  '0.6.12': {
    path: require.resolve('solc-0.6.12/soljson.js'),
    longVersion: '0.6.12+commit.27d51765'
  }
}

subtask(TASK_COMPILE_SOLIDITY_GET_SOLC_BUILD).setAction(async ({ solcVersion }) => {
  const compiler = LOCAL_SOLC[solcVersion]
  if (compiler) {
    return {
      compilerPath: compiler.path,
      isSolcJs: true,
      version: solcVersion,
      longVersion: compiler.longVersion
    }
  }

  throw new Error(`No local Solidity compiler configured for ${solcVersion}`)
})

const CHAIN_IDS = {
   hardhat: 31337,
   kovan: 42,
 };

module.exports = {
   defaultNetwork: 'hardhat',

   networks: {
      hardhat: {
         chainId: 47805,
         allowUnlimitedContractSize: true,
         saveDeployments: true,
         tags: ['local']
      },
      local: {
         live: false,
         url: 'http://127.0.0.1:7545',
         saveDeployments: true,
         tags: ['local']
      },
      kovan: {
         // url: `https://kovan.infura.io/v3/${process.env.INFURA_ID}`,
         url:"https://goerli.infura.io/v3/145acbee350d44709d5e64f496e0e954",
         accounts: ["0xcc9693641b8de1aa54f7c606bbb92e2b7cb35c3cff721d7dbda8731cb56f6ca1"],
         saveDeployments: true
       }
   },
   namedAccounts: {
      deployer: {
        default: 0,
        [CHAIN_IDS.kovan]: 0,
      },
      admin: {
        default: 0,
        [CHAIN_IDS.kovan]: 0,
      },
   },
   paths: {
      deploy: 'deployments/migrations',
      deployments: 'deployments/artifacts',
   },
   external: {
      contracts: [
        {
          artifacts: "node_modules/@uniswap/v2-core/build",
        },
        {
         artifacts: "node_modules/@uniswap/v2-periphery/build",
       }
      ],
   },
   solidity: {
      compilers: [
         {
            version: '0.5.12',
            settings: {
               optimizer: {
                  enabled: true,
                  runs: 200,
               },
            },
         },
         {
            version: '0.5.16',
            settings: {
               optimizer: {
                  enabled: true,
                  runs: 200,
               },
            },
         },
         {
            version: '0.4.23',
            settings: {
               optimizer: {
                  enabled: true,
                  runs: 200,
               },
            },
         },
         {
            version: '0.6.12',
            settings: {
               optimizer: {
                  enabled: true,
                  runs: 200,
               },
            },
         },
         {
            version: '0.6.6',
            settings: {
               optimizer: {
                  enabled: true,
                  runs: 200,
               },
            },
         },
      ],
   },
   mocha: {
      timeout: 200000,
   },
   etherscan: {
      apiKey: "UPVJPC4C39RIRA8NTFUF71T645DAHBGZ7A"
    }
};
