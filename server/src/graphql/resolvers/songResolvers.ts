import { protect } from "@/middleware";
import { MusicContext } from "../context.types";
import { atLeast } from "@/helpers";
import { ROLE_HIERARCHY } from "@/constants";

export const songResolvers = {
  Query: {
    search: protect<undefined, MusicContext, { query: string, limit?: number }>(
      atLeast('basic'),
      async (_, { query, limit }, context) => {
        const role = context.user?.role!;
        const response = await context.services.song.search(query, limit || 50);
        if (ROLE_HIERARCHY[role] >= ROLE_HIERARCHY["admin"]) return response;
        else return response.filter(s => s.duration <= 600);
      }
      ,
      { sanitizeFields: ['query'] }
    ),
    searchLocally: protect<undefined, MusicContext, { query: string }>(
      atLeast('basic'),
      async (_, { query }, context) => await context.services.song.searchLocally(query)
      ,
      { sanitizeFields: ['query'] }
    ),

    getRelated: protect<undefined, MusicContext, { id: string, numberOfSongs: number }>(
      atLeast("basic"),
      async (_, { id, numberOfSongs }, context) =>
        await context.services.song.getRelatedSongs(id, numberOfSongs)
    ),
  },
};