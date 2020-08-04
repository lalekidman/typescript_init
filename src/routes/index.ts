import * as express from 'express'
import {Request, Response, NextFunction, Router} from 'express'
import * as HttpStatus from 'http-status-codes'
import { requestParamsValidatorMiddleware } from '../utils/helper'
import { IndexPostValidationPipeline } from '../validator'
export default class _Router {
  /**
   * @class initiate router class
   */
  private readonly router: Router
  constructor () {
    this.router = Router({mergeParams: true})
  }
  private listRoute = (req: Request, res: Response, next: NextFunction) => {
    res.status(HttpStatus.OK).send({result: true})
  }
  private addRoute = (req: Request, res: Response, next: NextFunction) => {
    res.status(HttpStatus.CREATED).send({result: true})
  }
  private getByIdRoute = (req: Request, res: Response, next: NextFunction) => {
    res.status(HttpStatus.OK).send({result: true})
  }
  private updateRoute = (req: Request, res: Response, next: NextFunction) => {
    res.status(HttpStatus.ACCEPTED).send({result: true})
  }
  private deleteRoute = (req: Request, res: Response, next: NextFunction) => {
    res.status(HttpStatus.ACCEPTED).send({result: true})
  }
  public expose () {
    this.router.get('/', this.listRoute)
    this.router.post('/',
      requestParamsValidatorMiddleware(IndexPostValidationPipeline),
      this.addRoute
    )
    this.router.get('/:id', this.getByIdRoute)
    this.router.put('/:id', this.updateRoute)
    this.router.delete('/:id', this.deleteRoute)
    return this.router
  }
}