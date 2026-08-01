import { authResolvers } from "./authResolvers";
import { songResolvers } from "./songResolvers";

export const resolvers = {
  Query: {
    ...songResolvers.Query,
    ...authResolvers.Query
  },
  Mutation: {
    ...authResolvers.Mutation,
  }

}