import { NextFunction, Request, Response } from 'express';
import { debug } from 'winston';
import * as OneSplitContract from '../contracts/OneSplit.contract'

class ArbController {
  public getChance = async (req: Request, res: Response, next: NextFunction): void => {
    try {
      debug("called /arb/getChance");

      let expectedReturn: OneSplitContract.ExpectedReturnType = await OneSplitContract.call.getExpectedReturn(
        "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
        "0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359",
        100,
        10,
        0
      )
      console.log(expectedReturn)

      res.status(200).json({
        expectedReturn
      })
    } catch (error) {
      next(error);
    }
  };
}

export default ArbController;
