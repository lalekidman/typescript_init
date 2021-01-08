import {
  ITodoRepositoryGateway
} from '../../entity/todo'
import { IGeneralInteractorDependencies } from '../../interfaces'

interface IServiceDependencies extends IGeneralInteractorDependencies<ITodoRepositoryGateway> {}
export class RemoveTodo {
  constructor (protected deps: IServiceDependencies) {
  }
  public removeOne = async (id: number) => {
    try {
      const removedTodo = await this.deps.repositoryGateway.removeById(<any>id)
      return removedTodo
    } catch (error) {
      console.log('*** failed to remove todo. :>> ', error);
      throw error
    }
  }
}