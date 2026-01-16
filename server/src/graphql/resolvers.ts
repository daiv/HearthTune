import { resolverContext } from "../types/types";

export const resolvers = {
  Query: {
    search: async (_parent: undefined, { query, limit }: { query: string, limit?: number }, context: resolverContext) => {
      const { songService } = context;
      return await songService.search(query, limit || 10);
    },
  },
};