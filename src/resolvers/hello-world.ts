import {Query, Resolver} from 'type-graphql'

@Resolver()
export class HelloWorldResolver {
  @Query(() => String)
  public hello () {
    return "hi!"
  }
}