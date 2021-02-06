import { getWeb3Instance, NetworkType, setPrivateKey } from '../utils/Web3';
import { CONTRACT_ADDRESS_DAI, ABI } from '../contractsInfo/ERC20.contractInfo';
import { TransactionReceipt } from 'web3-core';
import BigNumber from 'bignumber.js';
import { debug } from 'winston';

const getDAIContract = async () => {
  // Instantiates a web3
  const web3 = getWeb3Instance(NetworkType['forked-main']);
  setPrivateKey(web3);

  const DAI = new web3.eth.Contract(ABI, CONTRACT_ADDRESS_DAI);
  DAI.options.from = web3.eth.accounts.wallet[0].address; // default from owner address
  DAI.options.gasPrice = (5e9).toString();
  DAI.options.gas = 4e6;

  return DAI;
};

const balanceOf = async (owner: string) => {
  // TokenSwap
  const DAI = await getDAIContract();

  try {
    const res = await DAI.methods.balanceOf(owner).call();
    debug(res);
    return res;
  } catch (err) {
    throw err;
  }
};

const transfer = async (to: string, amount: number) => {
  const DAI = await getDAIContract();

  const bnAmount = new BigNumber(amount);
  const bnDecimals = new BigNumber(1e18);

  try {
    // transaction
    const txReceipt: TransactionReceipt = (await DAI.methods.transfer(to, bnAmount.multipliedBy(bnDecimals).toFixed()).send()) as TransactionReceipt;
    return txReceipt;
  } catch (err) {
    throw err;
  }
};

// ------------------------ export ------------------------

// sendTx
export const sendTx = {
  transfer,
};

// call
export const call = {
  balanceOf,
};

// event
export const event = {};
