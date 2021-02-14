import { NextFunction, Request, Response } from 'express';
import { debug } from 'winston';
import BigNumber from 'bignumber.js';
import ArbService from '../services/arb.service';
import * as TokenSwap from '../contracts/TokenSwap.contract';

class ArbController {
  public arbService = new ArbService();

  private orgToken = 'WETH';
  private orgAmount = 1000;
  private viaTokens: string[] = [
    'DAI',
    'WBTC',
    'USDC',
    'USDT',
    'TUSD',
    'BAT',
    'MKR',
    'SNX',
    'LINK',
    'MANA',
    'ENJ',
    'COMP',
    'AAVE',
    'YFI',
    'CRV',
    'SUSHI',
    'UNI',
    '1INCH',
    'SAI',
    'NMR',
    'ZRX',
    'BAL',
  ];

  public watch = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      debug('called /arb/watch');

      const result = await this.arbService.watch(this.orgToken, this.orgAmount, this.viaTokens);

      res.status(200).json({
        bestForwardQuote: result.bestForwardQuote,
        bestInverseQuote: result.bestInverseQuote,
        buyTokenInterestRatePairs: result.buyTokenInterestRatePairs,
      });
    } catch (error) {
      next(error);
    }
  };

  public execute = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      debug('called /arb/execute');

      const result = await this.arbService.watch(this.orgToken, this.orgAmount, this.viaTokens);

      const bestForwardQuote = result.bestForwardQuote;
      const bestInverseQuote = result.bestInverseQuote;
      const buyTokenInterestRatePairs = result.buyTokenInterestRatePairs;

      // レートが1番いいものをarbitrage
      const value = new BigNumber(bestForwardQuote.value).plus(new BigNumber(bestInverseQuote.value)).toFixed();
      const estimatedGas = await TokenSwap.estimateGas.arbitrageEstimateGas(
        bestForwardQuote.sellTokenAddress,
        bestForwardQuote.sellAmount,
        bestForwardQuote.buyTokenAddress,
        bestForwardQuote.allowanceTarget,
        bestForwardQuote.to,
        bestForwardQuote.data,
        bestInverseQuote.allowanceTarget,
        bestInverseQuote.to,
        bestInverseQuote.data,
        value,
      );
      // const txReceipt = await TokenSwap.sendTx.arbitrage(
      //   bestForwardQuote.sellTokenAddress,
      //   bestForwardQuote.sellAmount,
      //   bestForwardQuote.buyTokenAddress,
      //   bestForwardQuote.allowanceTarget,
      //   bestForwardQuote.to,
      //   bestForwardQuote.data,
      //   bestInverseQuote.allowanceTarget,
      //   bestInverseQuote.to,
      //   bestInverseQuote.data,
      //   value,
      // );
      res.status(200).json({
        bestForwardQuote,
        bestInverseQuote,
        buyTokenInterestRatePairs,
        estimatedGas,
        // txReceipt,
      });
    } catch (error) {
      next(error);
    }
  };

  // public getChance = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  //   try {
  //     debug('called /arb/getChance');

  //     // ETH to
  //     const expectedReturn = await this.arbService.getChance();
  //     console.log(expectedReturn);

  //     res.status(200).json({
  //       expectedReturn,
  //     });
  //   } catch (error) {
  //     next(error);
  //   }
  // };

  // public zeroxPrice = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  //   try {
  //     debug('called /arb/zerox');

  //     const sellTokens = [
  //       'DAI',
  //       'WETH',
  //       'BAT',
  //       'MKR',
  //       'WBTC',
  //       'SNX',
  //       'LINK',
  //       'MANA',
  //       'ENJ',
  //       'POWR',
  //       'COMP',
  //       'AAVE',
  //       'YFI',
  //       'AMPL',
  //       'CRV',
  //       'SUSHI',
  //       'UNI',
  //       '1INCH',
  //     ];
  //     const sellTokenToPriceMap = await this.arbService.getSellTokenToPriceMap(sellTokens);

  //     const initialAmount = 1000;
  //     const bnInitialAmount = new BigNumber(initialAmount);

  //     // DAIからの往復を計算
  //     const buyTokenToPriceMapForDai = sellTokenToPriceMap['DAI'];
  //     // const buyTokenToInterestRateMap: BuyTokenToInterestRateMap = {}
  //     const buyTokenInterestRatePairs: BuyTokenInterestRatePair[] = [];
  //     Object.keys(buyTokenToPriceMapForDai).forEach(buyToken => {
  //       // debug(`----- DAI => ${buyToken} => DAI -----`)
  //       console.log(`----- DAI => ${buyToken} => DAI -----`);
  //       const forwardPrice = buyTokenToPriceMapForDai[buyToken];
  //       const inversePrice = sellTokenToPriceMap[buyToken]['DAI'];

  //       console.log(`forward price: ${forwardPrice}[${buyToken}/DAI]`);
  //       console.log(`inverse price: ${inversePrice}[DAI/${buyToken}]`);

  //       const bnForwardPrice = new BigNumber(forwardPrice);
  //       const bnInversePrice = new BigNumber(inversePrice);

  //       const bnFinalAmount = bnInitialAmount.dividedBy(bnForwardPrice).dividedBy(bnInversePrice);
  //       const bnPercentage = bnFinalAmount.minus(bnInitialAmount).multipliedBy(new BigNumber(100)).dividedBy(bnInitialAmount);
  //       // debug(`initial: ${initialAmount} => final: ${bnFinalAmount.toFixed()}  (${bnPercentage.toFixed()}[%])\n\n`)
  //       console.log(`initial: ${initialAmount} => final: ${bnFinalAmount.toFixed()}  (${bnPercentage.toFixed()}[%])\n`);

  //       // buyTokenToInterestRateMap[buyToken] = bnPercentage.toFixed();
  //       buyTokenInterestRatePairs.push({ buyToken, interestRate: bnPercentage.toFixed() });
  //     });

  //     // レートがいい順に並べ替え
  //     buyTokenInterestRatePairs.sort((a, b) => {
  //       return new BigNumber(b.interestRate).comparedTo(new BigNumber(a.interestRate));
  //     });

  //     res.status(200).json(buyTokenInterestRatePairs);
  //   } catch (error) {
  //     next(error);
  //   }
  // };
}

export default ArbController;
