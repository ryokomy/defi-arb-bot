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
      const fromSymbolToSymbolPricePairs = await this.arbService.getFromSymbolToSymbolPricePairs(sellTokens);

      res.status(200).json(fromSymbolToSymbolPricePairs);
    } catch (error) {
      next(error);
    }
  };
}

export default ArbController;
