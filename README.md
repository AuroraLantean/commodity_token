### Commodity Token

#### Setup repository

- Clone this repository from:
  `$ git clone git@github.com:AuroraLantean/commodity_token.git`

- Use Solidity 0.8.17 according to Hardhat's support:
  https://hardhat.org/hardhat-runner/docs/reference/solidity-support#supported-versions

- Install Node JS v18.12.0 according to your platform: https://nodejs.org/en/download/

- Install NodeJs dependencies
  `$ yarn install`

- Implement the env.template variables in a .env file.

```
CHAIN_ID=11155111
INFURA_API_KEY=0
MNEMONIC=
ADMIN=YOUR_WALLET_ACCOUNT_WITH_0x
ADMINPK=PRIVATE_KEY_OF_YOUR_ACCOUNT_ABOVE
USER1PK=PRIVATE_KEY_OF_YOUR_ACCOUNT1
USER2PK=PRIVATE_KEY_OF_YOUR_ACCOUNT2
NODE_URL=http://127.0.0.1:8545/
REPORT_GAS=<Optional: true_or_false>
```

---

## Test the Ethereum Smart Contracts

$ `npx hardhat test`

---

## Test Deployment script

in terminal one: $`yarn hnode`
in terminal two: $`yarn deploylocal`

#### Deploy Contracts To Sepolia network via Hardhat

- Paste your Ethereum account in a Twitter tweet.
- Paste that tweet URL to https://faucet-sepolia.rockx.com/
- You need 0.2 Ethers to deploy on Sepolia network
- Deploy contract in terminal: $`yarn deploysepolia`
- One deployed contract on Sepolia: 0xBC8D41B7eEE9825b6d8246654f1ac6f55AE823C5

#### After Deployment

- You can find the contract ABI under this project/build/contracts/ERC20UStakingU.sol/ERC20U.json

- YOU MUST KEEP/DUPLICATE YOUR `.openzeppelin` FOLDER AND YOUR DEPLOYMENT PRIVATE KEY INTACT. ANY CHANGE OF THAT FOLDER CONTENT OR LOSING THE PRIVATE KEY MAY MAKE YOU UNABLE TO UPGRADE YOUR CONTRACT FOREVER. IF THAT HAPPENS, YOU CAN ONLY DEPLOY A NEW CONTRACT. THERE IS NO OTHER WAY AROUND IT!

#### Note

"chalk Error [ERR_REQUIRE_ESM]: require() of ES Module not supported" is caused by the chalk package has been converted to be an ESM only package in version 5, which means that the package cannot be imported with require() anymore.
Solution: downgrade to Chalk "4.1.2"
