import { Router } from 'express';
import ArbController from '../controllers/arb.controller';
import Route from '../interfaces/routes.interface';

class ArbRoute implements Route {
  public path = '/arb';
  public router = Router();
  public arbController = new ArbController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}/getChance`, this.arbController.getChance);
    this.router.get(`${this.path}/zerox`, this.arbController.zerox);
  }
}

export default ArbRoute;
