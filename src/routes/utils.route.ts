import { Router } from 'express';
import UtilsController from '../controllers/utils.controller';
import Route from '../interfaces/routes.interface';

class UtilsRoute implements Route {
  public path = '/utils';
  public router = Router();
  public utilsController = new UtilsController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}/balanceOf`, this.utilsController.balanceOf);
    this.router.get(`${this.path}/daiBalanceOf`, this.utilsController.daiBalanceOf);
    this.router.post(`${this.path}/daiTransfer`, this.utilsController.daiTransfer);
  }
}

export default UtilsRoute;
