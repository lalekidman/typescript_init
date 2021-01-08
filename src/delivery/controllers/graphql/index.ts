import {
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
  GraphQLNonNull,
  GraphQLBoolean,
} from 'graphql'

const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Hello world',
    fields: () => ({
      message: {
        type: GraphQLString,
        resolve: () => 'Resolve'
      }
    })
  })
})