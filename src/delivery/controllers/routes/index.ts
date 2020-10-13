import {Request, Response, NextFunction, Router} from 'express'
import * as HttpStatus from 'http-status-codes'
import { requestParamsValidatorMiddleware } from '../../helpers'
import { IndexPostValidationPipeline } from '../../validator'
import {MainUseCase} from '../../../use-cases/index'
import {MainDB} from '../../../app-plugins/persistence/db'
export default class _Router {
  /**
   * @class initiate router class
   */
  private readonly router: Router
  constructor () {
    this.router = Router({mergeParams: true})
  }
  private listRoute = (req: Request, res: Response, next: NextFunction) => {
    new MainUseCase(new MainDB())
      .findAllMain(req.query)
      .then((response) => {
        res.status(HttpStatus.OK).send({result: true, data: response})
      })
      .catch(err => {
        console.log(' > err', err)
        res.status(HttpStatus.BAD_REQUEST).send({result: false, error: err.message})
      })
  }
  private addRoute = (req: Request, res: Response, next: NextFunction) => {
    // const data = req.body
    new MainUseCase(new MainDB())
      .saveMain(req.body)
      .then((response) => {
        res.status(HttpStatus.CREATED).send({result: true, data: response})
      })
      .catch(err => {
        res.status(HttpStatus.BAD_REQUEST).send({result: false, error: err.message})
      })
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
      // requestParamsValidatorMiddleware(IndexPostValidationPipeline),
      this.addRoute
    )
    this.router.get('/:id', this.getByIdRoute)
    this.router.put('/:id', this.updateRoute)
    this.router.delete('/:id', this.deleteRoute)
    return this.router
  }
}