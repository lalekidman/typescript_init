import {Request, Response, NextFunction, Router} from 'express'
import BranchSettings from '../class/settings'
import * as HttpStatus from 'http-status-codes' 
import AppError from '../utils/app-error';
import * as RC from '../utils/response-codes'
import { IRequest } from '../utils/interfaces';
const multiPartMiddleWare = require('connect-multiparty')()

export default class Settings {
  /**
   * @param client redis client for token auth
   */
  private readonly app: Router
  constructor () {
    // initialize redis
    this.app = Router({mergeParams: true})
  }
  /**
   * route for updateding or incrementing the total queuegroup created.
   */
  public updateTotalQueueGroupCreated = (req: IRequest, res: Response, next: NextFunction) => {
    const {branchId = ''} = req.params
    new BranchSettings(branchId)
    .updateQueueGroupCounter()
    .then((response: any) => {
      res.status(HttpStatus.OK).send(response)
    })
    .catch((err) => {
      if (err.statusCode) {
        res.status(HttpStatus.BAD_REQUEST).send(err)
      } else {
        res.status(HttpStatus.BAD_REQUEST).send(new AppError(RC.UPDATE_BRANCH_FAILED, err.message))
      }
    })
  }
  /**
   * route for updating operation hours
   */
  public updateOperationHours = (req: IRequest, res: Response, next: NextFunction) => {
    const {branchId = ''} = req.params
    const {isWeeklyOpened = false, operationHours = []} = req.body
    new BranchSettings(branchId)
    .updateOperationHours({isWeeklyOpened, operationHours})
    .then((response: any) => {
      res.status(HttpStatus.OK).send({
        operationHours: response.operationHours,
        isWeeklyOpened: response.isWeeklyOpened
      })
    })
    .catch((err) => {
      if (err.statusCode) {
        res.status(HttpStatus.BAD_REQUEST).send(err)
      } else {
        res.status(HttpStatus.BAD_REQUEST).send(new AppError(RC.UPDATE_BRANCH_FAILED, err.message))
      }
    })
  }
  /**
   * route for updating location
   */
  public updateLocation = (req: IRequest, res: Response, next: NextFunction) => {
    const {branchId = ''} = req.params
    const {location = []} = req.body
    const Branch = new BranchSettings(branchId)
    Branch.updateGeoLocation(location)
    .then((response: any) => {
      res.status(HttpStatus.OK).send(response)
    })
    .catch((err) => {
      if (err.statusCode) {
        res.status(HttpStatus.BAD_REQUEST).send(err)
      } else {
        res.status(HttpStatus.BAD_REQUEST).send(new AppError(RC.UPDATE_BRANCH_FAILED, err.message))
      }
    })
  }
  public initializeRoutes () {
    this.app.patch('/queue-group-counter', this.updateTotalQueueGroupCreated)
    this.app.patch('/operation-hours', this.updateOperationHours)
    this.app.patch('/location', this.updateLocation)
    return this.app
  }
}