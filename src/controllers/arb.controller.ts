import { NextFunction, Request, Response } from 'express';
import { debug } from 'winston';

class ArbController {
  public getChance = (req: Request, res: Response, next: NextFunction): void => {
    try {
      debug("called /arb/getChance");
      res.status(200).json({
        message: "called /arb/getChance successfully"
      })
    } catch (error) {
      next(error);
    }
  };
}

export default ArbController;
