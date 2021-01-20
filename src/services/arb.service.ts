import * as OneSplitContract from '../contracts/OneSplit.contract';
import axios, { AxiosRequestConfig } from 'axios';

// type
type SymbolPricePair = {
  symbol: string;
  price: string;
};
type SymbolPricePairInfo = {
  [symbol: string]: SymbolPricePair[];
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

  public async getSymbolPricePairInfo(sellTokens: string[]) {
    const url = 'https://api.0x.org/swap/v1/prices?sellToken=';

    const promises = [];
    sellTokens.forEach(sellToken => {
      promises.push(axios.get(url + sellToken));
    });
    const responses = await Promise.all(promises);

    const symbolPricePairInfo: SymbolPricePairInfo = {};
    responses.forEach((response, index) => {
      symbolPricePairInfo[sellTokens[index]] = response.data.records;
    });

    return symbolPricePairInfo;
  }
}

export default ArbService;
