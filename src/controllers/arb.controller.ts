import { NextFunction, Request, Response } from 'express';
import { debug } from 'winston';
import ArbService from '../services/arb.service';
import BigNumber from 'bignumber.js';
import zeroxTokenInfo from '../utils/zeroxTokenInfo';
import * as TokenSwap from '../contracts/TokenSwap.contract';

// type BuyTokenToInterestRateMap = {
//   [buyTokenSymbol: string]: string;
// }
type BuyTokenInterestRatePair = {
  buyToken: string;
  interestRate: string;
};

class ArbController {
  public arbService = new ArbService();

  public getChance = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      debug('called /arb/getChance');

      // ETH to
      const expectedReturn = await this.arbService.getChance();
      console.log(expectedReturn);

      res.status(200).json({
        expectedReturn,
      });
    } catch (error) {
      next(error);
    }
  };

  public zerox = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      debug('called /arb/zerox');

      const orgToken = 'DAI';
      const orgAmount = 1000; // 1000[DAI]
      const transformedTokens = [
        'WETH',
        'BAT',
        'MKR',
        'WBTC',
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
      ];
      const sellTokenToQuoteMap = await this.arbService.getSellTokenToQuoteMap(orgToken, orgAmount, transformedTokens);

      // DAIからの往復を計算
      const buyTokenInterestRatePairs: BuyTokenInterestRatePair[] = [];
      transformedTokens.forEach(transformedToken => {
        console.log(`----- ${orgToken} => ${transformedToken} => ${orgToken} -----`);
        const transformedDecimals = zeroxTokenInfo[transformedToken].decimals;

        const forwardQuote = sellTokenToQuoteMap[orgToken][transformedToken];
        const inverseQuote = sellTokenToQuoteMap[transformedToken][orgToken];

        const guaranteedPrice = inverseQuote.guaranteedPrice;
        const bnSellAmount = new BigNumber(inverseQuote.sellAmount).dividedBy(new BigNumber(`1e${transformedDecimals}`));

        const bnFinalAmount = new BigNumber(guaranteedPrice).multipliedBy(bnSellAmount);

        const bnOrgAmount = new BigNumber(orgAmount);
        const bnPercentage = bnFinalAmount.minus(bnOrgAmount).multipliedBy(new BigNumber(100)).dividedBy(bnOrgAmount);
        console.log(`interest rate: ${bnPercentage.toFixed()}[%]`);
        console.log(`initial: ${orgAmount} => final: ${bnFinalAmount.toFixed()}`);

        // DEX
        forwardQuote.sources.forEach(source => {
          if (Number(source.proportion) > 0) {
            console.log(`forward source: ${source.name}  (${Number(source.proportion) * 100}[%])`);
          }
        });
        inverseQuote.sources.forEach(source => {
          if (Number(source.proportion) > 0) {
            console.log(`inverse source: ${source.name}  (${Number(source.proportion) * 100}[%])`);
          }
        });

        console.log('\n');

        // buyTokenToInterestRateMap[buyToken] = bnPercentage.toFixed();
        buyTokenInterestRatePairs.push({ buyToken: transformedToken, interestRate: bnPercentage.toFixed() });
      });

      // レートがいい順に並べ替え
      buyTokenInterestRatePairs.sort((a, b) => {
        return new BigNumber(b.interestRate).comparedTo(new BigNumber(a.interestRate));
      });

      // レートが1番いいアービトラージ
      const bestForwardQuote = sellTokenToQuoteMap[orgToken][buyTokenInterestRatePairs[0].buyToken];
      const bestInverseQuote = sellTokenToQuoteMap[buyTokenInterestRatePairs[0].buyToken][orgToken];

      // レートが1番いいものをarbitrage
      const value = new BigNumber(bestForwardQuote.value).plus(new BigNumber(bestInverseQuote.value)).toFixed();
      const txReceipt = await TokenSwap.sendTx.arbitrage(
        bestForwardQuote.sellTokenAddress,
        bestForwardQuote.buyTokenAddress,
        bestForwardQuote.allowanceTarget,
        bestForwardQuote.to,
        bestForwardQuote.data,
        bestInverseQuote.allowanceTarget,
        bestInverseQuote.to,
        bestInverseQuote.data,
        value,
      );

      res.status(200).json({
        bestForwardQuote,
        bestInverseQuote,
        buyTokenInterestRatePairs,
        txReceipt,
      });
    } catch (error) {
      next(error);
    }
  };

  public zeroxPrice = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      debug('called /arb/zerox');

      const sellTokens = [
        'DAI',
        'WETH',
        'BAT',
        'MKR',
        'WBTC',
        'SNX',
        'LINK',
        'MANA',
        'ENJ',
        'POWR',
        'COMP',
        'AAVE',
        'YFI',
        'AMPL',
        'CRV',
        'SUSHI',
        'UNI',
        '1INCH',
      ];
      const sellTokenToPriceMap = await this.arbService.getSellTokenToPriceMap(sellTokens);

      const initialAmount = 1000;
      const bnInitialAmount = new BigNumber(initialAmount);

      // DAIからの往復を計算
      const buyTokenToPriceMapForDai = sellTokenToPriceMap['DAI'];
      // const buyTokenToInterestRateMap: BuyTokenToInterestRateMap = {}
      const buyTokenInterestRatePairs: BuyTokenInterestRatePair[] = [];
      Object.keys(buyTokenToPriceMapForDai).forEach(buyToken => {
        // debug(`----- DAI => ${buyToken} => DAI -----`)
        console.log(`----- DAI => ${buyToken} => DAI -----`);
        const forwardPrice = buyTokenToPriceMapForDai[buyToken];
        const inversePrice = sellTokenToPriceMap[buyToken]['DAI'];

        console.log(`forward price: ${forwardPrice}[${buyToken}/DAI]`);
        console.log(`inverse price: ${inversePrice}[DAI/${buyToken}]`);

        const bnForwardPrice = new BigNumber(forwardPrice);
        const bnInversePrice = new BigNumber(inversePrice);

        const bnFinalAmount = bnInitialAmount.dividedBy(bnForwardPrice).dividedBy(bnInversePrice);
        const bnPercentage = bnFinalAmount.minus(bnInitialAmount).multipliedBy(new BigNumber(100)).dividedBy(bnInitialAmount);
        // debug(`initial: ${initialAmount} => final: ${bnFinalAmount.toFixed()}  (${bnPercentage.toFixed()}[%])\n\n`)
        console.log(`initial: ${initialAmount} => final: ${bnFinalAmount.toFixed()}  (${bnPercentage.toFixed()}[%])\n`);

        // buyTokenToInterestRateMap[buyToken] = bnPercentage.toFixed();
        buyTokenInterestRatePairs.push({ buyToken, interestRate: bnPercentage.toFixed() });
      });

      // レートがいい順に並べ替え
      buyTokenInterestRatePairs.sort((a, b) => {
        return new BigNumber(b.interestRate).comparedTo(new BigNumber(a.interestRate));
      });

      res.status(200).json(buyTokenInterestRatePairs);
    } catch (error) {
      next(error);
    }
  };
}

export default ArbController;
