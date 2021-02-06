import { getWeb3Instance, NetworkType, setPrivateKey } from '../utils/Web3';
import { CONTRACT_ADDRESS, ABI } from '../contractsInfo/TokenSwap.contractInfo';

const getTokenSwapContract = async () => {
  // Instantiates a web3
  const web3 = getWeb3Instance(NetworkType['forked-main']);
  setPrivateKey(web3);

  const OneSplit = new web3.eth.Contract(ABI, CONTRACT_ADDRESS);
  OneSplit.options.from = web3.eth.accounts.wallet[0].address; // default from owner address

  return OneSplit;
};

/**
 * call: WorldTree.existsUserMonsterId
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

// ------------------------ export ------------------------

// sendTx
export const sendTx = {};

// call
export const call = {
  debugBalanceTokenOfSender,
};

// event
export const event = {};
