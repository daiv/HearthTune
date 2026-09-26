import { protect } from "@/middleware/protect";
import { MusicContext } from "../context.types";
import { atLeast } from "@/helpers";

export const songResolvers = {
  Query: {
    search: protect<undefined, MusicContext, { query: string, limit?: number }>(
      atLeast('basic'),
      async (_, { query, limit }, context) => {
        return await context.services.songs.search(query, limit || 50);
      }
      ,
      { sanitizeFields: ['query'] }
    ),
    searchLocally: protect<undefined, MusicContext, { query: string }>(
      atLeast('basic'),
      async (_, { query }, context) => await context.services.songs.searchLocally(query)
      ,
      { sanitizeFields: ['query'] }
    ),

    getRelated: protect<undefined, MusicContext, { id: string, numberOfSongs: number }>(
      atLeast("basic"),
      async (_, { id, numberOfSongs }, context) =>
        await context.services.songs.getRelatedSongs(id, numberOfSongs)
    ),
  },
};