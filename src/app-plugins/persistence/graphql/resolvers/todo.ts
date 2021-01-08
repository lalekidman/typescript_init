import {
  Arg,
  Field,
  InputType,
  Int,
  Mutation,
  Query,
  Resolver,
  createUnionType
} from 'type-graphql'

import { Todo } from '../schema/todo'

@InputType()
class TodoParams {
  @Field()
  content!: string
  // genre!: string|number
}
@Resolver()
export abstract class TodoResolver {
  @Mutation(() => Boolean)
  public async createTodo (@Arg("params", () => TodoParams) params: any) {
    await Todo.insert({
      ...params,
      createdAt: Date.now(),
    })
    return true
  }
  @Mutation(() => Boolean)
  public async removeTodo (@Arg("id", () => Int) todoId: number) {
    await Todo.delete({_id: todoId})
    return true
  }
  @Query(() => [Todo])
  public async todoList() {
    return Todo.find()
  }
}