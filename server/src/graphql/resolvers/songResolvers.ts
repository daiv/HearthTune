import { protect } from "@/middleware/protect";
import { MusicContext } from "../context.types";
import { atLeast } from "@/helpers";

export const songResolvers = {
  Query: {
    search: protect<undefined, MusicContext, { query: string, limit?: number }>(
      atLeast('basic'),
      async (_parent, { query, limit }, context) => {
        return await context.services.songs.search(query, limit || 50);
      }
    ),
    getRelated: protect<undefined, MusicContext, { id: string, numberOfSongs: number }>(
      atLeast("basic"),
      async (_parent, { id, numberOfSongs }, context) => {
        return await context.services.songs.getRelatedSongs(id, numberOfSongs);
      }
    ),
  }
};