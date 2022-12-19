import { ethers, network } from "hardhat";
import { BigNumber, Contract } from "ethers";
import chalk from 'chalk';
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

//--------------------==
export const printRecord = async (instCtrt: Contract, tokenAddr: string, userAddr: string, prefix: string, option: string = "") => {
  const rec = await instCtrt.records(tokenAddr, userAddr);
  if (option !== "") log1(prefix + " record: stakedAmount:", fromWei(rec.stakedAmount), ", stakedAt:", rec.stakedAt.toString(), "\nunstakedAmount:", fromWei(rec.unstakedAmount), ", unstakedAt:", rec.unstakedAt.toString(), ", rewardAmount:", fromWei(rec.rewardAmount));
  return rec;
}

//--------------------==
export const bigNum = (item: any) => BigNumber.from(item);
export const log1 = console.log;

export const addr0 = "0x0000000000000000000000000000000000000000";
export const burnAddress = "0x000000000000000000000000000000000000dEaD";

//--------------------==
export const logGreen = (text: string) => console.log(chalk.green(text))

export const logRed = (text: string) => console.log(chalk.red(text))
export const logMagenta = (text: string) => console.log(chalk.magentaBright(text))
export const logCyan = (text: string) => console.log(chalk.cyanBright(text))
export const logWB = (text: string) => console.log(chalk.white.bgBlue.bold(text))
export const logGB = (text: string) => console.log(chalk.green.bgBlue.bold(text))
//--------------------==

//--------------------==
export const fromWei = (weiAmount: BigNumber | string, dp = "18") => ethers.utils.formatUnits(weiAmount.toString(), parseInt(dp));//dp = "6" or "18", output: string

export const toWei = (amount: number | string | BigNumber, dp = "18") => ethers.utils.parseUnits(amount.toString(), parseInt(dp));//output: Bn

//web3.utils.fromWei(weiAmount.toString(), "ether");
//web3.utils.toWei(amount.toString(), "ether");

//--------------------== Hardhat Network Reference
//https://hardhat.org/hardhat-network/reference/
//also see Ganache JSON-RPC

//---------------==
export const isEmpty = (value: undefined | null | object | string | number): boolean =>
  value === undefined ||
  value === null ||
  (typeof value === 'object' && Object.keys(value).length === 0) ||
  (typeof value === 'string' && value.trim().length === 0) || (typeof value === 'string' && value === 'undefined');
