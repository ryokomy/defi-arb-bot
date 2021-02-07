import * as OneSplitContract from '../contracts/OneSplit.contract';
import axios, { AxiosRequestConfig } from 'axios';
import zeroxTokenInfo from '../utils/zeroxTokenInfo';
import BigNumber from 'bignumber.js';
import { QuoteResponse } from '../@types/zeroxApiResponse';

// type
type SymbolPricePair = {
  symbol: string;
  price: string;
};
type BuyTokenToPriceMap = {
  [buyTokenSymbol: string]: string;
};
type SellTokenToPriceMap = {
  [sellTokenSymbol: string]: BuyTokenToPriceMap;
};
type BuyTokenToQuoteMap = {
  [buyTokenSymbol: string]: QuoteResponse;
};
type SellTokenToQuoteMap = {
  [sellTokenSymbol: string]: BuyTokenToQuoteMap;
};
type BuyTokenInterestRatePair = {
  buyToken: string;
  interestRate: string;
};

class ArbService {
  public async getChance(): Promise<OneSplitContract.ExpectedReturnType> {
    const expectedReturn: OneSplitContract.ExpectedReturnType = await OneSplitContract.call.getExpectedReturn(
      '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
      '0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359',
      100,
      10,
      0,
    );

    return expectedReturn;
  }

  public async getSymbolPricePairs(sellToken: string): Promise<SymbolPricePair[]> {
    const url = 'https://api.0x.org/swap/v1/prices';
    const config: AxiosRequestConfig = {
      params: {
        sellToken,
      },
    };
    const response = await axios.get(url, config);
    const symbolPricePairs = response.data.records as SymbolPricePair[];

    return symbolPricePairs;
  }

  public async getSellTokenToPriceMap(sellTokens: string[]): Promise<SellTokenToPriceMap> {
    const url = 'https://api.0x.org/swap/v1/prices?sellToken=';

    const promises = [];
    sellTokens.forEach(sellToken => {
      promises.push(axios.get(url + sellToken));
    });
    const responses = await Promise.all(promises);

    const sellTokenToPriceMap: SellTokenToPriceMap = {};
    responses.forEach((response, index) => {
      const buyTokenToPriceMap: BuyTokenToPriceMap = {};
      (response.data.records as SymbolPricePair[]).forEach(symbolPricePair => {
        if (sellTokens.includes(symbolPricePair.symbol)) {
          buyTokenToPriceMap[symbolPricePair.symbol] = symbolPricePair.price;
        }
      });
      sellTokenToPriceMap[sellTokens[index]] = buyTokenToPriceMap;
    });

    return sellTokenToPriceMap;
  }

  public async getSellTokenToQuoteMap(orgToken: string, orgAmount: number, transformedTokens: string[]) {
    const sellTokenToQuoteMap: SellTokenToQuoteMap = {};
    const url = 'https://api.0x.org/swap/v1/quote';

    // forward
    {
      // forwardのquoteをクエリ
      const forwardPromises = [];
      transformedTokens.forEach(transformedToken => {
        const sellToken = orgToken;
        const decimals = zeroxTokenInfo[sellToken].decimals;
        const sellAmount = new BigNumber(orgAmount).multipliedBy(new BigNumber(`1e${decimals}`)).toFixed();
        const buyToken = transformedToken;
        const config: AxiosRequestConfig = {
          params: {
            sellToken,
            sellAmount,
            buyToken,
          },
        };
        forwardPromises.push(axios.get(url, config));
      });
      const forwardResponses = await Promise.all(forwardPromises);

      // forwardに対するquoteのマップを作成
      const buyTokenToQuoteMapForOrgToken: BuyTokenToQuoteMap = {};
      forwardResponses.forEach((rawResponse, index) => {
        const response = rawResponse.data as QuoteResponse;
        buyTokenToQuoteMapForOrgToken[transformedTokens[index]] = response;
      });
      sellTokenToQuoteMap[orgToken] = buyTokenToQuoteMapForOrgToken;
    }

    // inverse
    {
      // inverseのquoteをクエリ
      const inversePromises = [];
      transformedTokens.forEach(transformedToken => {
        const sellToken = transformedToken;
        const decimals = zeroxTokenInfo[sellToken].decimals;
        const guaranteedPrice = sellTokenToQuoteMap[orgToken][transformedToken].guaranteedPrice;
        const sellAmount = new BigNumber(guaranteedPrice)
          .multipliedBy(new BigNumber(orgAmount))
          .multipliedBy(new BigNumber(`1e${decimals}`))
          .toFixed();
        // 以下はベストな取引価格の場合なので今回は使わない
        // const sellAmount = sellTokenToQuoteMap[orgToken][transformedToken].buyAmount  // = sellTokenToQuoteMap[orgToken][transformedToken].price * orgAmount * decimals
        const buyToken = orgToken;
        const config: AxiosRequestConfig = {
          params: {
            sellToken,
            sellAmount,
            buyToken,
          },
        };
        inversePromises.push(axios.get(url, config));
      });
      const inverseResponses = await Promise.all(inversePromises);

      // inverseに対するquoteのマップを作成
      inverseResponses.forEach((rawResponse, index) => {
        const response = rawResponse.data as QuoteResponse;
        const buyTokenToQuoteMap: BuyTokenToQuoteMap = {};
        buyTokenToQuoteMap[orgToken] = response;
        sellTokenToQuoteMap[transformedTokens[index]] = buyTokenToQuoteMap;
      });
    }

    return sellTokenToQuoteMap;
  }

  public getBuyTokenInterestRatePairs(orgToken: string, orgAmount: number, transformedTokens: string[], sellTokenToQuoteMap: SellTokenToQuoteMap) {
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

    return buyTokenInterestRatePairs;
  }
}

export default ArbService;
