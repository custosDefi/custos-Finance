# Deploy Desyn with Hardhat

This repository contains the scripts to deploy the Desyn Core contracts to ethereum mainnet node.

In Scripts you will find also a test run (with no assertions) that can be run against a local node (much faster).

## Getting Started

Clone this repository 

```
https://github.com/desynlab/desyn-protocol
cd desyn-protocol
``` 

Install dependencies:

```
npm i
```

Add your PK in the `hardhat.config.js` file (please take care of you PK, they provide direct access to your funds, this is only for demostration purposes). Once you are ready you can run for a Standalone deployment:

```
npx hardhat run --network standalone scripts/deploy-desyn.js
```

Or for ethereum mainnet:

```
npx hardhat run --network mainnet scripts/deploy-desyn.js
```

You can also run the "test" with the following code:

```
npx hardhat run --network standalone scripts/test-around.js
```

Have fun :) 

