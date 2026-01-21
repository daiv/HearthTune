import { GraphQLError } from "graphql/error";
import { resolverContext } from "../types/types";

export const resolvers = {
  Query: {
    search: async (_parent: undefined, { query, limit }: { query: string, limit?: number }, { songService }: resolverContext) => {
      return await songService.search(query, limit || 50);
    },
    getRelated: async (_parent: undefined, { id }: { id: string }, { songService }: resolverContext) => {
      try {
        return await songService.getRelated(id);
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