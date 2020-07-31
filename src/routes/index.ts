import * as express from 'express'
import {Request, Response, NextFunction, Router} from 'express'
import * as HttpStatus from 'http-status-codes'
export default class _Router {
  /**
   * @class initiate router class
   */
  private readonly router: Router
  constructor () {
    this.router = Router({mergeParams: true})
  }

  public expose () {
    this.router.get('/', (req: Request, res: Response, next: NextFunction) => {
      res.status(HttpStatus.OK).send({result: true})
    })
    this.router.post('/', (req: Request, res: Response, next: NextFunction) => {
      res.status(HttpStatus.CREATED).send({result: true})
    })
    this.router.get('/:id', (req: Request, res: Response, next: NextFunction) => {
      res.status(HttpStatus.OK).send({result: true})
    })
    this.router.put('/:id', (req: Request, res: Response, next: NextFunction) => {
      res.status(HttpStatus.ACCEPTED).send({result: true})
    })
    this.router.delete('/:id', (req: Request, res: Response, next: NextFunction) => {
      res.status(HttpStatus.ACCEPTED).send({result: true})
    })
    return this.router
  }
}