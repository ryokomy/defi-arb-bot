import { getWeb3Instance, NetworkType, setPrivateKey } from '../utils/Web3';
import { CONTRACT_ADDRESS, ABI } from '../contractsInfo/OneSplit.contractInfo';

const getOneSplitContract = async () => {
  // Instantiates a web3
  const web3 = getWeb3Instance(NetworkType.main);
  setPrivateKey(web3);

  const OneSplit = new web3.eth.Contract(ABI, CONTRACT_ADDRESS);
  OneSplit.options.from = web3.eth.accounts.wallet[0].address; // default from owner address

  return OneSplit;
};

/**
 * call: WorldTree.existsUserMonsterId
 */
const getExpectedReturn = async (
  fromToken: string,
  destToken: string,
  amount: number,

  parts: number,
  flags: number,
) => {
  // OneSplit
  const OneSplit = await getOneSplitContract();

  try {
    const res = await OneSplit.methods.getExpectedReturn(fromToken, destToken, amount, parts, flags).call();
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
  getExpectedReturn,
};

// event
export const event = {};

// type
export type ExpectedReturnType = {
  returnAmount: number;
  distribution: number[];
};
