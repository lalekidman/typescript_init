import {Request, Response, NextFunction, Router} from 'express'
import IndustryRoute from './industry'
export default class AccountRoute {

  /**
   * 
   * @param client redis client for token auth
   */
  private readonly app: Router
  constructor () {
    // initialize redis
    this.app = Router({mergeParams: true})
  }
  public initializeRoutes () {
    this.app.use('/industry', new IndustryRoute().initializeRoutes())
    return this.app
  }
}