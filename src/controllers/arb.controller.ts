import { NextFunction, Request, Response } from 'express';
import { debug } from 'winston';
import ArbService from '../services/arb.service';

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

      const sellTokens = ['DAI', 'WETH', '1INCH'];
      const symbolPricePairInfo = await this.arbService.getSymbolPricePairInfo(sellTokens);

      res.status(200).json(symbolPricePairInfo);
    } catch (error) {
      next(error);
    }
  };
}

export default ArbController;
