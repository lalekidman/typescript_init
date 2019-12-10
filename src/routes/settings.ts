import {Request, Response, NextFunction, Router} from 'express'
import BranchSettings from '../class/settings'
import * as HttpStatus from 'http-status-codes' 
import AppError from '../utils/app-error';
import * as RC from '../utils/response-codes'
import { IRequest } from '../utils/interfaces';
import notification from '../class/notification';
import { BRANCH_NOTIFICATION_TYPES } from '../utils/constants';
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
    // @ts-ignore
    let accountData = JSON.parse(req.headers.user)
    const {isWeeklyOpened = false, operationHours = []} = req.body
    new BranchSettings(branchId)
    .updateOperationHours({isWeeklyOpened, operationHours})
    .then((response: any) => {
      // notify business
      notification.invokeNotif(
        branchId,
        {
          actionBy: `${accountData.account.firstName} ${accountData.account.lastName}`
        },
        BRANCH_NOTIFICATION_TYPES.OPERATION_HOURS_UPDATE
      )
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
    // @ts-ignore
    let accountData = JSON.parse(req.headers.user)
    const Branch = new BranchSettings(branchId)
    Branch.updateGeoLocation(location)
    .then((response: any) => {
      notification.invokeNotif(
        branchId,
        {
          actionBy: `${accountData.account.firstName} ${accountData.account.lastName}`
        },
        BRANCH_NOTIFICATION_TYPES.ADDRESS_UPDATE
      )
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
   * suspend branch (should not be allowed inside operation hours)
   */
  private suspendBranch = (req: Request, res: Response) => {
    const {branchId} = req.params
    const Branch = new BranchSettings(branchId)
    // Branch.suspend()
    // .then((suspended) => {
    //   res.status(HttpStatus.OK).json(suspended)
    // })
    // .catch((error) => {
    //   if (error.message) {
    //     return res.status(HttpStatus.BAD_REQUEST).json(new AppError(RC.UPDATE_BRANCH_FAILED, error.message))
    //   }
    //   res.status(HttpStatus.BAD_REQUEST).json(error)
    // })
  }
  /**
   * unsuspend branch
   */
  private unsuspendBranch = (req: Request, res: Response) => {
    const {branchId} = req.params
    const Branch = new BranchSettings(branchId)
    // Branch.unsuspend()
    // .then((unsuspended) => {
    //   res.status(HttpStatus.OK).json(unsuspended)
    // })
    // .catch((error) => {
    //   res.status(HttpStatus.BAD_REQUEST).json(error)
    // })
  }
  public initializeRoutes () {
    // this.app.patch('/unsuspend', this.unsuspendBranch)
    // this.app.patch('/suspend', this.suspendBranch)
    this.app.patch('/queue-group-counter', this.updateTotalQueueGroupCreated)
    this.app.patch('/operation-hours', this.updateOperationHours)
    this.app.patch('/location', this.updateLocation)
    return this.app
  }
}