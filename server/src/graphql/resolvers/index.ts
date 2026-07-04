import { authResolvers } from "./authResolvers";
import { songResolvers } from "./songResolvers";

export const resolvers = {
  Query: {
    ...songResolvers.Query,
  },
  Mutation: {
    ...authResolvers.Mutation,
  }

}