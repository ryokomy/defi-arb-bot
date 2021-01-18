import * as OneSplitContract from '../contracts/OneSplit.contract';
import axios from 'axios';

// type
type SymbolPricePair = {
  symbol: string;
  price: string;
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
    const response = await axios.get(`https://api.0x.org/swap/v1/prices?${sellToken}`);
    const symbolPricePairs = response.data.records as SymbolPricePair[];

    return symbolPricePairs;
  }
}

export default ArbService;
