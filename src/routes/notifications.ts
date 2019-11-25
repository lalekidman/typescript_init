import {Request, Response, NextFunction, Router} from 'express'
import BranchModel from '../models/branches'
import * as HttpStatus from 'http-status-codes' 
import AppError from '../utils/app-error';
import * as RC from '../utils/response-codes'
import { IRequest } from '../utils/interfaces';
import * as appConstants from '../utils/constants'
import * as regExp from '../utils/regularExpressions'
import notification from  '../class/notification'
import Queue from '../class/queue'
export default class Route {
  /**
   * 
   * @param client redis client for token auth
   */
  private readonly app: Router

  constructor () {
    this.app = Router({mergeParams: true})
  }

  /**
   * invoke customer rate info notification for each fucking branch every monday
   * invoked by a cron 
   */
  private promptCustomerRateNotification = (request: Request, response: Response) => {
    BranchModel.find()
    .then(async (branches) => {
      for (let i in branches) {
        // notify the branch
        const {_id} = branches[i]
        let customerRates = await Queue.getBranchCustomerRates(_id, -1, 0)
        const {r1, r2} = customerRates
        if (!r1 && !r2) {
          console.log(`CUSTOMER RATE NOTIFICATION: No comparison for branch ${_id}`)
        }
        if (r1 > r2) {
          // decrease
          console.log('DECREASE')
          console.log(`r1: ${r1}, r2: ${r2},`)
          // promt notification here
          await notification.invokeNotif(_id, customerRates, appConstants.BRANCH_NOTIFICATION_TYPES.CUSTOMER_RATE_DECREASE)
        }
        if (r1 < r2) {
          // increase
          console.log('INCREASE')
          console.log(`r1: ${r1}, r2: ${r2},`)
          // promt notification here
          await notification.invokeNotif(_id, customerRates, appConstants.BRANCH_NOTIFICATION_TYPES.CUSTOMER_RATE_INCREASE)
        }
      }
      response.sendStatus(HttpStatus.OK)
    })
    .catch((error) => {
      response.status(HttpStatus.BAD_REQUEST).json(error)
    })
  }

  public initializeRoutes() {
    this.app.post('/customer-rates', this.promptCustomerRateNotification)
    return this.app
  }
}