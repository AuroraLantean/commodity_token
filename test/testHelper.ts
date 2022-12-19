import { ethers, network } from "hardhat";
import { BigNumber, Contract } from "ethers";

//--------------------==
export const printRecord = async (instCtrt: Contract, tokenAddr: string, userAddr: string, prefix: string, option: string = "") => {
  const rec = await instCtrt.records(tokenAddr, userAddr);
  if (option !== "") log1(prefix + " record: stakedAmount:", fromWei(rec.stakedAmount), ", stakedAt:", rec.stakedAt.toString(), "\nunstakedAmount:", fromWei(rec.unstakedAmount), ", unstakedAt:", rec.unstakedAt.toString(), ", rewardAmount:", fromWei(rec.rewardAmount));
  return rec;
}

//--------------------==
export const bigNum = (item: any) => BigNumber.from(item);
export const log1 = console.log;

//--------------------==
export const fromWei = (weiAmount: BigNumber | string, dp = "18") => ethers.utils.formatUnits(weiAmount.toString(), parseInt(dp));//dp = "6" or "18", output: string

export const toWei = (amount: number | string | BigNumber, dp = "18") => ethers.utils.parseUnits(amount.toString(), parseInt(dp));//output: Bn

