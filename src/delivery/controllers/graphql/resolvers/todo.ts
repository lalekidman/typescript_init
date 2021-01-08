import {
  Arg,
  Field,
  InputType,
  Int,
  Mutation,
  Query,
  Resolver,
} from 'type-graphql'

import { 
  createTodo,
  todoList,
  removeTodo,
  updateTodo
 } from '../../../services-configuration/todo'

import {
  TodoSchema
} from '../../../../app-plugins/persistence/graphql/schema/todo'
import {
  ITodoParams,
  ITodoEntity
} from '../../../../domain/entity/todo'

@InputType()
class TodoParams implements ITodoParams{
  @Field()
  content!: string
  // genre!: string|number
}
@Resolver()
export abstract class TodoResolver {
  @Mutation(() => Boolean)
  public async createTodo (@Arg("params", () => TodoParams) params: any) {
    const newTodo = await createTodo().createOne(params)
    // await createTodo().createOne(params)
    // return newTodo
    return true
  }
  @Mutation(() => Boolean)
  public async removeTodo (@Arg("id", () => Int) todoId: number) {
    await removeTodo().removeOne(todoId)
    return true
  }
  @Mutation(() => Boolean)
  public async updateTodo (
    @Arg("id", () => Int) todoId: number,
    @Arg("params", () => TodoParams) params: any) {
    await updateTodo().updateOne(<any>todoId, params)
    return true
  }
  @Query(() => [TodoSchema])
  public async todoList() {
    return todoList().getList()
  }
}