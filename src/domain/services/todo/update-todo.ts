import {
  TodoEntity
} from '../../'
import {
  ITodoEntity,
  ITodoParams,
  ITodoRepositoryGateway
} from '../../entity/todo'
import { IGeneralInteractorDependencies } from '../../interfaces'

interface IServiceDependencies extends IGeneralInteractorDependencies<ITodoRepositoryGateway> {}
export class UpdateTodo {
  
  constructor (protected deps: IServiceDependencies) {

  }
  public updateOne = async (id: string, params: ITodoParams) => {
    const {
      content
    } = params
    const todo = new TodoEntity({content})
    // insert todo on the repository
    await this.deps.repositoryGateway.updateOne({
      _id: id
    }, {
      content: todo.content,
      updatedAt: todo.updatedAt
    })
    return todo
  }
}