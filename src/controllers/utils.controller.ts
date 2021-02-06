import { NextFunction, Request, Response } from 'express';
import { debug } from 'winston';
import * as ERC20 from '../contracts/ERC20.contract';
import BigNumber from 'bignumber.js';
import { getWeb3Instance, NetworkType, setPrivateKey } from '../utils/Web3';
import * as TokenSwapInfo from '../contractsInfo/TokenSwap.contractInfo';
import zeroxTokenInfo from '../utils/zeroxTokenInfo';

class UtilsController {
  public daiBalanceOf = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      debug('called /utils/balanceOf');

      const web3 = getWeb3Instance(NetworkType['forked-main']);
      setPrivateKey(web3);

      // const address = web3.eth.accounts.wallet[0].address;
      const address = TokenSwapInfo.CONTRACT_ADDRESS;

      const symbol = 'DAI';
      const balance = await ERC20.call.balanceOf(symbol, address);
      const bnBalance = new BigNumber(balance);
      const bnDecimals = new BigNumber(`1e${zeroxTokenInfo[symbol].decimals}`);

      const balanceDAI: string = bnBalance.dividedBy(bnDecimals).toFixed();

      res.status(200).json({
        balanceDAI,
      });
    } catch (error) {
      next(error);
    }
  };

  public balanceOf = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      debug('called /utils/balanceOf');

      const web3 = getWeb3Instance(NetworkType['forked-main']);
      setPrivateKey(web3);

      const address = web3.eth.accounts.wallet[0].address;
      // const address = TokenSwapInfo.CONTRACT_ADDRESS;

      const balance = await web3.eth.getBalance(address);
      const bnBalance = new BigNumber(balance);
      const bnDecimals = new BigNumber(1e18);

      const balanceETH: string = bnBalance.dividedBy(bnDecimals).toFixed();

      res.status(200).json({
        balanceETH,
      });
    } catch (error) {
      next(error);
    }
  };

  public daiTransfer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      debug('called /utils/balanceOf');

      const web3 = getWeb3Instance(NetworkType['forked-main']);
      setPrivateKey(web3);

      const address = TokenSwapInfo.CONTRACT_ADDRESS;
      const amount = 1000;
      const symbol = 'DAI';

      const txReceipt = await ERC20.sendTx.transfer(symbol, address, amount);

      res.status(200).json({
        txReceipt,
      });
    } catch (error) {
      next(error);
    }
  };
}

export default UtilsController;
