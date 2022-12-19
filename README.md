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

#### Deploy Ethereum Smart Contracts via Hardhat

#### Note

"chalk Error [ERR_REQUIRE_ESM]: require() of ES Module not supported" is caused by the chalk package has been converted to be an ESM only package in version 5, which means that the package cannot be imported with require() anymore.
Solution: downgrade to Chalk "4.1.2"
