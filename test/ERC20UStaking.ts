/* Simple Staking */
/**
 * @title Simple Staking Contract
 * @author Raymond Lieu: PAID Network 2021.10 */
import { ethers, network, upgrades, waffle } from 'hardhat';
const provider = waffle.provider;
import {
  BigNumber,
  Contract,
  ContractFactory,
  ContractReceipt,
  ContractTransaction,
  Signer,
} from 'ethers';
import { expect } from 'chai';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';

import {
  bigNum,
  toWei,
  fromWei,
  log1,
  printRecord,
} from './testHelper';

let accounts: SignerWithAddress[];
let user0: SignerWithAddress,
  user1: SignerWithAddress,
  user2: SignerWithAddress;

let Staking1: ContractFactory;
let staking: Contract;
let Staking2: ContractFactory;
let stakingAddr: string;

let RemToken1: ContractFactory;
let remToken1: Contract;
let token: Contract;
let RemToken2: ContractFactory;
let tokenAddr: string;

let user0Addr: string,
  user1Addr: string,
  user2Addr: string;
let tx: ContractTransaction;
let receipt: ContractReceipt;
let version: BigNumber, versionNew: BigNumber;

let balance0: BigNumber,
  balance1: BigNumber,
  balance2: BigNumber,
  balanceBf: BigNumber,
  balanceAf: BigNumber,
  balanceStaking: BigNumber,
  allowance: BigNumber,
  amt1: BigNumber,
  amt2: BigNumber,
  unstakedAt: BigNumber;

//let eventsfiltered: Event[] | undefined;
let eventsfiltered: any, rec: any;

before(async () => { });

const userInitBalance = toWei(bigNum(1000));

describe('ERC20U + StakingU', function () {
  beforeEach(async function () {
    log1('\n------------==');
    accounts = await ethers.getSigners();
    user0 = accounts[0];
    user1 = accounts[1];
    user2 = accounts[2];
    user0Addr = user0.address;
    user1Addr = user1.address;
    user2Addr = user2.address;
    log1('user0:', user0Addr, '\nuser1:', user1Addr, '\nuser2:', user2Addr);

    log1("deploying token contract...")
    RemToken1 = await ethers.getContractFactory('ERC20U');
    remToken1 = await upgrades.deployProxy(RemToken1, ['RemToken', 'RemToken']);
    //remToken1 = await RemToken1.deploy();
    await remToken1.deployed();
    tokenAddr = remToken1.address;
    expect(tokenAddr).to.properAddress;
    log1('remToken1:', tokenAddr, ', its user0:', await remToken1.owner());
    version = await remToken1.version();
    log1('its owner:', await remToken1.owner(), ', version:', version.toNumber());

    log1("\nupgrading token contract...")
    RemToken2 = await ethers.getContractFactory("ERC20UU");
    token = await upgrades.upgradeProxy(tokenAddr, RemToken2);
    version = await token.version();
    log1('its owner:', await token.owner(), ', version:', version.toNumber());

    versionNew = version.add(bigNum(1));
    log1('new token version to be set:', versionNew.toNumber());
    tx = await token.setVersion(versionNew);
    log1("setting token new version...")
    log1(`tx successful: ${tx.hash}`);
    version = await token.version();
    log1('token contract version:', version.toNumber());

    log1("\nminting tokens to user0, user1 and user2...")
    await token.connect(user0).mint(user0Addr, userInitBalance);
    await token.connect(user0).mint(user1Addr, userInitBalance);
    await token.connect(user0).mint(user2Addr, userInitBalance);

    log1("\ndeploying staking contract...")
    Staking1 = await ethers.getContractFactory('ERC20StakingU');
    staking = await upgrades.deployProxy(Staking1);
    //staking= await Staking1.deploy();
    await staking.deployed();
    stakingAddr = staking.address;
    expect(stakingAddr).to.properAddress;
    log1(
      'staking contract:',
      stakingAddr,
      ', its owner:',
      await staking.owner()
    );

    log1("\nupgrading staking contract...")
    Staking2 = await ethers.getContractFactory("ERC20StakingUU");
    staking = await upgrades.upgradeProxy(stakingAddr, Staking2);
    version = await staking.version();
    log1('its owner:', await staking.owner(), ', version:', version.toNumber());

    versionNew = version.add(bigNum(1));
    log1('new staking version to be set:', versionNew.toNumber());
    tx = await staking.setVersion(versionNew);
    log1("setting staking new version...")
    log1(`tx successful: ${tx.hash}`);
    version = await staking.version();
    log1('staking contract version:', version.toNumber());

    //timestamp = await getBlockTimestamp();
    log1('end of initial setup');
  });

  it('users should have correct initial balances, and contracts have correct versions', async () => {
    log1('\n--------== check 1');
    version = await token.version();
    log1('token contract version:', version.toNumber());
    expect(version).to.equal(2, 'e000');
    version = await staking.version();
    log1('staking contract version:', version.toNumber());
    expect(version).to.equal(2, 'e000');

    balance0 = await token.balanceOf(user1Addr);
    log1('user0 balance', fromWei(balance0));
    expect(balance0).to.equal(userInitBalance, 'e000');

    balance1 = await token.balanceOf(user1Addr);
    log1('user1 balance', fromWei(balance1));
    expect(balance1).to.equal(userInitBalance, 'e001');

    balance2 = await token.balanceOf(user2Addr);
    log1('user2 balance', fromWei(balance2));
    expect(balance2).to.equal(userInitBalance, 'e002');
  });

  it('only token admin can mint tokens, and set version', async () => {
    log1('\n--------== check 1');
    await expect(
      token.connect(user1).mint(user1Addr, userInitBalance)
    ).to.be.revertedWith("Ownable: caller is not the owner");

    log1('\n--------== check 2');
    await expect(
      token.connect(user1).setVersion(versionNew)
    ).to.be.revertedWith("Ownable: caller is not the owner");
  });

  it('users should be able to transfer tokens to EOAs', async () => {
    log1('\n--------== check 1');
    amt1 = toWei(100);
    log1('user1 to transfer ', fromWei(amt1), 'to user2');
    await token.connect(user1).transfer(user2Addr, amt1);

    balance1 = await token.balanceOf(user1Addr);
    log1('user1 balance', fromWei(balance1));
    expect(balance1).to.equal(userInitBalance.sub(amt1), 'e001');

    balance2 = await token.balanceOf(user2Addr);
    log1('user2 balance', fromWei(balance2));
    expect(balance2).to.equal(userInitBalance.add(amt1), 'e002');
  });

  it('the token admin can burn tokens', async () => {
    log1('\n--------== check 1');
    version = await token.version();
    log1('token contract version:', version.toNumber());

    amt1 = toWei(320);
    balanceBf = await token.balanceOf(user0Addr);
    log1('user0 balance', fromWei(balanceBf));

    log1('--------== check 2');
    await token.connect(user0).burn(amt1);

    log1('--------== check 3');
    balanceAf = await token.balanceOf(user0Addr);
    log1('user0 balance', fromWei(balanceAf));
    expect(balanceAf).to.equal(balanceBf.sub(amt1), 'e003');

  });

  it('should allow user1 to stake tokens, wait for some time, then unstake & withdraw staked tokens', async () => {
    log1('\n--------== check 1');
    amt1 = toWei(100);
    allowance = await token.allowance(user1Addr, stakingAddr);
    log1('allowance bf:', fromWei(allowance));
    await token.connect(user1).approve(stakingAddr, amt1);
    allowance = await token.allowance(user1Addr, stakingAddr);
    log1('allowance af:', fromWei(allowance));
    log1('\n--------== check 2');

    await staking.connect(user1).stake(tokenAddr, amt1);

    await printRecord(staking, tokenAddr, user1Addr, 'user1', "log");
    log1('\n--------== check 3');
    // Forward in time...

    log1('\n--------== check 4');
    await staking.connect(user1).unstake(tokenAddr, amt1);
    log1('\nafter unstake()');

    rec = await printRecord(staking, tokenAddr, user1Addr, 'user1', "log");
    log1('rewardM:', fromWei(rec.rewardAmount));

    balanceBf = await token.balanceOf(user1Addr);
    log1('\nlp balance1 bf:', fromWei(balanceBf));
    await staking.connect(user1).withdrawUnstaked(tokenAddr, 0);
    balanceAf = await token.balanceOf(user1Addr);
    log1('lp balance1 af:', fromWei(balanceAf));
    expect(balanceAf).to.equal(balanceBf.add(amt1));

    log1('--------== end of ');
  });

  /*it("should have ", async () => {
    log1("\n--------== check 1");

    const balcETH_bf = await provider.getBalance(accounts[1].address);
    payable(addrTo).transfer(amount);

    log1("--------== end of ");
  });*/
});
