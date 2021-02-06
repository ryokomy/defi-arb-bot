import { getWeb3Instance, NetworkType, setPrivateKey } from '../utils/Web3';
import { ABI } from '../contractsInfo/ERC20.contractInfo';
import { TransactionReceipt } from 'web3-core';
import BigNumber from 'bignumber.js';
import { debug } from 'winston';
import zeroxTokenInfo from '../utils/zeroxTokenInfo';

const getERC20Contract = async (symbol: string) => {
  // Instantiates a web3
  const web3 = getWeb3Instance(NetworkType['forked-main']);
  setPrivateKey(web3);

  const ERC20 = new web3.eth.Contract(ABI, zeroxTokenInfo[symbol].address);
  ERC20.options.from = web3.eth.accounts.wallet[0].address; // default from owner address
  ERC20.options.gasPrice = (5e9).toString();
  ERC20.options.gas = 4e6;

  return ERC20;
};

const balanceOf = async (symbol: string, owner: string) => {
  // TokenSwap
  const ERC20 = await getERC20Contract(symbol);

  try {
    const res = await ERC20.methods.balanceOf(owner).call();
    debug(res);
    return res;
  } catch (err) {
    throw err;
  }
};

const transfer = async (symbol: string, to: string, amount: number) => {
  const ERC20 = await getERC20Contract(symbol);

  const bnAmount = new BigNumber(amount);
  const bnDecimals = new BigNumber(`1e${zeroxTokenInfo[symbol].decimals}`);

  try {
    // transaction
    const txReceipt: TransactionReceipt = (await ERC20.methods
      .transfer(to, bnAmount.multipliedBy(bnDecimals).toFixed())
      .send()) as TransactionReceipt;
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
