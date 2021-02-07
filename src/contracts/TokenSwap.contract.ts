import { getWeb3Instance, NetworkType, setPrivateKey } from '../utils/Web3';
import { CONTRACT_ADDRESS, ABI } from '../contractsInfo/TokenSwap.contractInfo';
import { TransactionReceipt } from 'web3-core';

const getTokenSwapContract = async () => {
  // Instantiates a web3
  const web3 = getWeb3Instance(NetworkType['forked-main']);
  setPrivateKey(web3);

  const TokenSwap = new web3.eth.Contract(ABI, CONTRACT_ADDRESS);
  TokenSwap.options.from = web3.eth.accounts.wallet[0].address; // default from owner address
  TokenSwap.options.gasPrice = (5e9).toString();
  TokenSwap.options.gas = 4e6;

  return TokenSwap;
};

/**
 * call: TokenSwap.debugBalanceTokenOfSender
 */
const debugBalanceTokenOfSender = async (token: string) => {
  // TokenSwap
  const TokenSwap = await getTokenSwapContract();

  try {
    const res = await TokenSwap.methods.debugBalanceTokenOfSender(token).call();
    return res;
  } catch (err) {
    throw err;
  }
};

/**
 * sendTx: TokenSwap.fillQuote
 */
const arbitrage = async (
  orgToken: string,
  flashLoanAmount: string,
  viaToken: string,
  forwardSpender: string,
  forwardSwapTarget: string,
  forwardSwapCallData: string,
  inverseSpender: string,
  inverseSwapTarget: string,
  inverseSwapCallData: string,
  value: string,
) => {
  // TokenSwap
  const TokenSwap = await getTokenSwapContract();

  try {
    // transaction
    const txReceipt: TransactionReceipt = (await TokenSwap.methods
      .arbitrage(
        orgToken,
        flashLoanAmount,
        viaToken,
        forwardSpender,
        forwardSwapTarget,
        forwardSwapCallData,
        inverseSpender,
        inverseSwapTarget,
        inverseSwapCallData,
      )
      .send({ value })) as TransactionReceipt;
    return txReceipt;
  } catch (err) {
    throw err;
  }
};

/**
 * sendTx: TokenSwap.fillQuote
 */
const fillQuote = async (sellToken: string, buyToken: string, spender: string, swapTarget: string, swapCallData: string, value: string) => {
  // TokenSwap
  const TokenSwap = await getTokenSwapContract();

  try {
    // transaction
    const txReceipt: TransactionReceipt = (await TokenSwap.methods
      .fillQuote(sellToken, buyToken, spender, swapTarget, swapCallData)
      .send({ value })) as TransactionReceipt;
    return txReceipt;
  } catch (err) {
    throw err;
  }
};

// ------------------------ export ------------------------

// sendTx
export const sendTx = {
  arbitrage,
  fillQuote,
};

// call
export const call = {
  debugBalanceTokenOfSender,
};

// event
export const event = {};
