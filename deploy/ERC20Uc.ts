import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { BigNumber, Contract, ContractFactory } from 'ethers';
import { ethers, network, upgrades } from 'hardhat';
import { bigNum, fromWei, log1, logRed, toWei, } from '../test/testHelper';
//import { waitForConfirmation, setEnv } from './deployHelper';

import hre from 'hardhat';
const addrFilePath = './.deployedCtrts';

const tokenName: string = 'GoldCoin';
const tokenSymbol: string = 'GLDC';
const defaultBlockConfirmation: number = 2;

export const waitForConfirmation = async (ctrt: Contract, network: string, blockConfirmation: number = defaultBlockConfirmation) => {
  if (network === "hardhat" || network === "hardhatnode") {
    log1(`skip block confirmation for ${network} network`);
    return;
  }
  log1(`waiting for ${blockConfirmation} block confirmation(s)...`);
  await ctrt.deployTransaction.wait(blockConfirmation);
  log1(`${blockConfirmation} block conformation(s) completed`);
}

async function main() {
  log1("-----------------== deployment script: ERC20Uc");
  let accounts: SignerWithAddress[];
  let owner: SignerWithAddress,
    user1: SignerWithAddress,
    user2: SignerWithAddress,
    user3: SignerWithAddress;
  let balance0ETH: BigNumber, balance1ETH: BigNumber;
  let ownerAddr: string,
    user1Addr: string,
    user2Addr: string,
    user3Addr: string;
  let tx: any, receipt: any;

  accounts = await ethers.getSigners();
  owner = accounts[0];
  user1 = accounts[1];
  ownerAddr = owner.address;
  user1Addr = user1.address;
  log1('owner:', ownerAddr, '\nuser1:', user1Addr);

  const network = hre.network.name;
  const chainId = hre.network.config.chainId;
  log1("network:", network, ", chainId:", chainId);
  if (network !== "hardhatnode" && network !== "hardhat") {
    balance0ETH = await owner.getBalance();
    log1("owner balance:", fromWei(balance0ETH));
    balance1ETH = await user1.getBalance();
    log1("user1 balance:", fromWei(balance1ETH));
  }

  let TokenU: ContractFactory;
  let tokenU: Contract;
  let tokenUAddr: string;
  let stakingUAddr: string;
  let version: BigNumber, versionNew: BigNumber;

  const tokenCtrtNameU: string = 'ERC20U';
  const tokenCtrtNameUU: string = 'ERC20UU';
  const stakingCtrtNameU: string = 'ERC20StakingU';
  const stakingCtrtNameUU: string = 'ERC20StakingUU';
  const tokenNameENV: string = 'ERC20U_TOKEN';
  const stakingNameENV: string = 'ERC20U_STAKING';

  log1("\n-----------== deploy token contract");
  log1('deployment contractName:', tokenCtrtNameU);
  log1("checkpoint 1")
  TokenU = await ethers.getContractFactory(tokenCtrtNameU);
  log1("checkpoint 2")
  tokenU = await upgrades.deployProxy(TokenU, [tokenName, tokenSymbol], { initializer: 'initialize' });
  log1("checkpoint 3")
  tx = await tokenU.deployed();
  log1('deployment hash', tokenU.deployTransaction.hash);
  await waitForConfirmation(tokenU, network);


  tokenUAddr = tokenU.address;
  version = await tokenU.version();
  log1(`Save ${tokenNameENV}:`, tokenUAddr, ', its owner:', await tokenU.owner(), ', version:', version.toNumber());

  log1("\n-----------== upgrade deployed contract");
  let TokenUU: ContractFactory;
  let tokenUU: Contract;
  log1('deployment contractName:', tokenCtrtNameUU);
  log1("original contract address:", tokenUAddr);
  log1("checkpoint 4")
  TokenUU = await ethers.getContractFactory(tokenCtrtNameUU);
  log1("checkpoint 5")
  tokenUU = await upgrades.upgradeProxy(tokenUAddr, TokenUU);
  log1("checkpoint 6")
  await waitForConfirmation(tokenUU, network);


  version = await tokenUU.version();
  log1('its owner:', await tokenUU.owner(), '\nversion:', version.toNumber());

  versionNew = version.add(bigNum(1));
  log1('new token version to be set:', versionNew.toNumber());
  tx = await tokenUU.setVersion(versionNew);
  log1("setting token new version...")
  receipt = await tx.wait().catch((err: any) => {
    log1("Error 001:", err);
    return 500;
  });
  log1(`tx successful: ${tx.hash}`);
  version = await tokenUU.version();
  log1('version:', version.toNumber());

  log1(`Save ${tokenNameENV}:`, tokenUAddr);

  /**
    log1("\n-----------== deploy staking contract");
    let StakingU: ContractFactory;
    let stakingU: Contract;
    log1('deployment contractName:', stakingCtrtNameU);
    log1(`${tokenNameENV}`, tokenUAddr);
    log1("checkpoint 11")
    StakingU = await ethers.getContractFactory(stakingCtrtNameU);
    log1("checkpoint 12")
    stakingU = await upgrades.deployProxy(StakingU, { initializer: 'initialize' });
    log1("checkpoint 13")
    tx = await stakingU.deployed();
    log1('deployment hash', stakingU.deployTransaction.hash);
    await waitForConfirmation(stakingU, network);
  
  
    stakingUAddr = stakingU.address;
    version = await stakingU.version();
    log1(
      `Save ${stakingNameENV}:`, stakingUAddr, ', its owner:',
      await stakingU.owner(), ', version:', version.toNumber());
  
  
    log1("\n-----------== upgrade deployed staking contract");
    let StakingUU: ContractFactory;
    let stakingUU: Contract;
    log1('deployment contractName:', stakingCtrtNameUU);
    log1(`${stakingNameENV}:`, stakingUAddr);
    log1("checkpoint 14")
    StakingUU = await ethers.getContractFactory(stakingCtrtNameUU);
    log1("checkpoint 15")
    stakingUU = await upgrades.upgradeProxy(stakingUAddr, StakingUU);
    log1("checkpoint 16")
    await waitForConfirmation(stakingUU, network);
  
  
    version = await stakingUU.version();
    log1('its owner:', await stakingUU.owner(), '\nversion:', version.toNumber());
  
    versionNew = version.add(bigNum(1));
    log1('new staking version to be set:', versionNew.toNumber());
    tx = await stakingUU.setVersion(versionNew);
    log1("setting staking new version...")
    receipt = await tx.wait().catch((err: any) => {
      log1("Error 002:", err);
      return 500;
    });
    log1(`tx successful: ${tx.hash}`);
    version = await stakingUU.version();
    log1('version:', version.toNumber());
  
   */

  log1('-----------------== ERC20Uc: successful');
}

main()
  .then(() => process.exit(0))
  .catch((error: Error) => {
    console.error(error);
    logRed("if error is 'No contract at address ... (Removed from manifest)' => remove .openzeppelin/unknown-{NetworkId}.json")
    process.exit(1);
  });