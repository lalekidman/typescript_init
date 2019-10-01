import {Request, Response, NextFunction, Router} from 'express'
import * as HttpStatus from 'http-status-codes'
import { IRequest } from '../utils/interfaces';
import Industry from '../class/industry'
import AppError from '../utils/app-error'
import * as RC from '../utils/response-codes'
const multiPartMiddleWare = require('connect-multiparty')()
export default class AccountRoute {

  /**
   * 
   * @param client redis client for token auth
   */
  private industry: Industry
  private readonly app: Router
  constructor () {
    // initialize redis
    this.app = Router({mergeParams: true})
    this.industry = new Industry()
  }
  private add = (req: IRequest, res: Response, next: NextFunction) => {
    console.log('req: ', req.body)
    const {icon} = req.files
    this.industry
      .save({...req.body, icon})
      .then((industry) => {
        res.status(HttpStatus.CREATED).send({
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
  private update = (req: IRequest, res: Response, next: NextFunction) => {
    const {icon} = req.files
    const {industryId} = req.params
    this.industry
      .updateOne(industryId, {...req.body, icon})
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
    this.industry
      .lists()
      .then((industryList) => {
        res.status(HttpStatus.OK).send({
          success: true,
          data: industryList
        })
      })
      .catch(err => {
        res.status(HttpStatus.BAD_REQUEST).send({error: err.message})
        // res.status(HttpStatus.BAD_REQUEST).send(new AppError(RC.))
      })
  }
  
  // idustry details
  private industryDetails = (req: IRequest, res: Response) => {
    this.industry.findOne({_id: req.params.industryId})
    .then((industry: any) => {
      res.status(HttpStatus.OK).json(industry)
    })
    .catch((error: Error) => {
      res.status(HttpStatus.BAD_REQUEST).json(error)
    })
  }

  public initializeRoutes () {
    this.app.post('/', multiPartMiddleWare, this.add)
    this.app.patch('/:industryId', multiPartMiddleWare, this.update)
    this.app.get('/:industryId', this.industryDetails)
    this.app.get('/', this.list)
    return this.app
  }
}