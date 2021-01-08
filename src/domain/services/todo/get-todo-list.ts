import {
  ITodoRepositoryGateway
} from '../../entity/todo'
import { IGeneralInteractorDependencies } from '../../interfaces'

interface IServiceDependencies extends IGeneralInteractorDependencies<ITodoRepositoryGateway> {}
export class TodoList {
  constructor (protected deps: IServiceDependencies) {
  }
  public getList = async () => {
    return this.deps.repositoryGateway.getList()
  }
}