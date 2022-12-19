import { task, HardhatUserConfig } from "hardhat/config";

import { config as dotenvConfig } from "dotenv";
import { resolve } from "path";
dotenvConfig({ path: resolve(__dirname, "./.env") });

import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import "@nomiclabs/hardhat-ethers";
import "hardhat-gas-reporter";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-web3";
import { ethers } from "ethers";
import '@openzeppelin/hardhat-upgrades';
//import "hardhat-erc1820";//for ERC777 deployment
//import 'hardhat-deploy';
//---------------==
const log1 = console.log;
const INFURA_API_KEY: string = process.env.INFURA_API_KEY || "";
const CHAIN_ID: string = process.env.CHAIN_ID || "";

const MNEMONIC: string = process.env.MNEMONIC || "";
const ADMINPK = process.env.ADMINPK || "";
const USER1PK = process.env.USER1PK || "";
const USER2PK = process.env.USER2PK || "";

if (INFURA_API_KEY === "" || CHAIN_ID === "" || MNEMONIC === "" || ADMINPK === "" || USER1PK === "" || USER2PK === "") {
  log1(".env not implemented properly");
  log1("INFURA_API_KEY:", INFURA_API_KEY);
  log1("CHAIN_ID:", CHAIN_ID);
  log1("MNEMONIC", MNEMONIC);
  log1("ADMINPK", ADMINPK);
  log1("USER1PK", USER1PK);
  log1("USER2PK", USER2PK);
} else {
  log1(".env file is valid");
}

// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (args, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    log1(account.address);
  }
});
log1("1 gwei:", ethers.utils.parseUnits("1", "gwei").toNumber());
//10 gwei = 10000000000

//https://hardhat.org/config/
const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",
  networks: {
    hardhatnode: {
      url: "http://127.0.0.1:8545",
      gasPrice: ethers.utils.parseUnits("10", "gwei").toNumber(),
      gas: 7e6,
      accounts: {
        mnemonic: `${MNEMONIC}`,
        path: "m/44'/60'/0'/0",
        initialIndex: 0,
        count: 20,
        passphrase: "",
      }
      //accounts: [privateKey1, privateKey2, ...]
      //accounts: { mnemonic: process.env.MNEMONIC },
    },
    hardhat: {
      gasPrice: ethers.utils.parseUnits("10", "gwei").toNumber(),
      gas: 7e6,
      accounts: {
        mnemonic: `${MNEMONIC}`,
        path: "m/44'/60'/0'/0",
        initialIndex: 0,
        count: 20,
        passphrase: "",
      }
    },
    sepolia: {
      url: `https://sepolia.infura.io/v3/${INFURA_API_KEY}`,
      chainId: 11155111,
      gasPrice: ethers.utils.parseUnits("20", "gwei").toNumber(),
      gas: 25e6,
      accounts: [`0x${ADMINPK}`, `0x${USER1PK}`, `0x${USER2PK}`],
    },
  },
  solidity: {
    compilers: [
      {
        version: "0.8.17",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    ],
    overrides: {
    },
  },
  mocha: {
    timeout: 2000000,
  },
  paths: {
    sources: "contracts",
    artifacts: "./build/artifacts",
    cache: "./build/cache",
  },

  gasReporter: {
    currency: "USD",
    gasPrice: 20000,      // automatically deduce gas price based on network congestion
    enabled: process.env.REPORT_GAS ? true : false,
  },
  typechain: {
    outDir: "./build/typechain/",
    target: "ethers-v5",
  },
};

export default config;
