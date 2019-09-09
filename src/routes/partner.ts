import {Request, Response, NextFunction, Router} from 'express'
import * as HttpStatus from 'http-status-codes'
import { IRequest } from '../utils/interfaces';
import Partner from '../class/partners'
import AppError from '../utils/app-error'
import * as RC from '../utils/response-codes'
const multiPartMiddleWare = require('connect-multiparty')()
export default class AccountRoute {

  /**
   * 
   * @param client redis client for token auth
   */
  private partner: Partner
  private readonly app: Router
  constructor () {
    // initialize redis
    this.app = Router({mergeParams: true})
    this.partner = new Partner()
  }
  private add = (req: IRequest, res: Response, next: NextFunction) => {
    const {avatar} = req.files
    this.partner
      .save({...req.body, avatar})
      .then((partner) => {
        res.status(HttpStatus.CREATED).send({
          success: true,
          data: partner
        })
      })
      .catch(err => {
        res.status(HttpStatus.BAD_REQUEST).send(new AppError(RC.ADD_PARTNER_FAILED, err.message))
        // res.status(HttpStatus.BAD_REQUEST).send(new AppError(RC.))
      })
  }
  private update = (req: IRequest, res: Response, next: NextFunction) => {
    const {avatar} = req.files
    const {partnerId} = req.params
    this.partner
      .updateOne(partnerId, {...req.body, avatar})
      .then((industry) => {
        res.status(HttpStatus.ACCEPTED).send({
          success: true,
          data: industry
        })
      })
      .catch(err => {
        console.log(err)
        res.status(HttpStatus.BAD_REQUEST).send({error: err.message})
        // res.status(HttpStatus.BAD_REQUEST).send(new AppError(RC.))
      })
  }
  private list = (req: IRequest, res: Response, next: NextFunction) => {
    this.partner
      .lists()
      .then((response) => {
        res.status(HttpStatus.OK).send(response)
      })
      .catch(err => {
        res.status(HttpStatus.BAD_REQUEST).send({error: err.message})
        // res.status(HttpStatus.BAD_REQUEST).send(new AppError(RC.))
      })
  }
  private findOne = (req: IRequest, res: Response, next: NextFunction) => {
    const {partnerId = ''} = req.params
    this.partner
      .viewById(partnerId)
      .then((response) => {
        if (!response._id) {
          throw new Error('No business partner found.')
        }
        res.status(HttpStatus.OK).send({
          success: true,
          data: response
        })
      })
      .catch(err => {
        res.status(HttpStatus.BAD_REQUEST).send(new AppError(RC.FETCH_PARTNER_DETAILS_FAILED, err.message))
      })
  }
  public initializeRoutes () {
    this.app.post('/', multiPartMiddleWare, this.add)
    this.app.patch('/:partnerId', multiPartMiddleWare, this.update)
    this.app.get('/:partnerId', this.findOne)
    this.app.get('/', this.list)
    return this.app
  }
}