import { authResolvers } from "./authResolvers";
import { playlistResolvers } from "./playlistResolvers";
import { songResolvers } from "./songResolvers";
import { userResolvers } from "./userResolvers";

export const resolvers = {
  Query: {
    ...songResolvers.Query,
    ...authResolvers.Query,
    ...userResolvers.Query,
    ...playlistResolvers.Query,
  },
  Mutation: {
    ...authResolvers.Mutation,
    ...userResolvers.Mutation,
    ...playlistResolvers.Mutation,
  },
  Playlist: {
    ...playlistResolvers.Playlist,
  }

}