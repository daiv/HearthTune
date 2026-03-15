import { GraphQLError } from "graphql/error";
import { resolverContext } from "../types/types";

export const resolvers = {
  Query: {
    search: async (_parent: undefined, { query, limit }: { query: string, limit?: number }, { songService }: resolverContext) => {
      return await songService.search(query, limit || 50);
    },
    getRelated: async (_parent: undefined, { id, numberOfSongs }: { id: string, numberOfSongs: number }, { songService }: resolverContext) => {
      try {
        return await songService.getRelatedSongs(id, numberOfSongs);
      } catch (error: unknown) {
        const errorMessage = String(error instanceof Error ? error.message : error);

        throw new GraphQLError(errorMessage,
          {
            extensions: {
              code: 'bad user input',
              http: { status: 400 }
            }
          }
        );
      }
    }
  },
};