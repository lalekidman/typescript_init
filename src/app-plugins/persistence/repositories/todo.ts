import {
  TodoSchema
} from '../graphql/schema/todo'

import {
  ITodoEntity,
  ITodoParams
} from '../../../domain/entity/todo'
export class TodoRepository {

  public async insertOne (data: ITodoEntity) {
    try {
      const {_id, ...todoData} = data
      const newTodo = await TodoSchema.insert(todoData)
      return JSON.parse(JSON.stringify(newTodo))
    } catch (error) {
      console.error('*** failed to insert new todo :>> ', error);
      throw error
    }
  }
  public async getList () {
    try {
      return TodoSchema.find()
    } catch (error) {
      console.error('*** failed to insert new todo :>> ', error);
      throw error
    }
  }
  public async removeById (id: number) {
    try {
      return TodoSchema.delete({
        _id: id
      })
    } catch (error) {
      console.error('*** failed to insert new todo :>> ', error);
      throw error
    }
  }
  public async updateOne ({_id}: any, updateTodo: ITodoParams) {
    try {
      return TodoSchema.update({
        _id: _id
      }, {
        content: updateTodo.content
      })
    } catch (error) {
      console.error('*** failed to insert new todo :>> ', error);
      throw error
    }
  }
}