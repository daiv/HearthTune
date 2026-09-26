import { authResolvers } from "./authResolvers";
import { songResolvers } from "./songResolvers";
import { userResolvers } from "./userResolvers";

export const resolvers = {
  Query: {
    ...songResolvers.Query,
    ...authResolvers.Query,
    ...userResolvers.Query,
  },
  Mutation: {
    ...authResolvers.Mutation,
    ...userResolvers.Mutation,
  }

}