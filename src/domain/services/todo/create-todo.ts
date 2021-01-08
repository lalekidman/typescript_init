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
export class CreateTodo {
  
  constructor (protected deps: IServiceDependencies) {

  }

  public createOne = async (params: ITodoParams) => {
    const {
      content
    } = params
    const newTodo = new TodoEntity({content})

    // insert todo on the repository
    await this.deps.repositoryGateway.insertOne({
      _id: newTodo._id,
      content: newTodo.content,
      createdAt: newTodo.createdAt,
      updatedAt: newTodo.updatedAt
    })
    return newTodo
  }
}