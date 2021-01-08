import {
  CreateTodo,
  TodoList,
  RemoveTodo,
  UpdateTodo
} from '../../domain/services/todo'

import {
  TodoRepository
} from '../../app-plugins/persistence/repositories/todo'

export const createTodo = () => (
  new CreateTodo({
    //@ts-expect-error
    repositoryGateway: new TodoRepository()
  })
)
export const removeTodo = () => (
  new RemoveTodo({
    //@ts-expect-error
    repositoryGateway: new TodoRepository()
  })
)
export const updateTodo = () => (
  new UpdateTodo({
    //@ts-expect-error
    repositoryGateway: new TodoRepository()
  })
)

export const todoList = () => (
  new TodoList({
    //@ts-expect-error
    repositoryGateway: new TodoRepository()
  })
)