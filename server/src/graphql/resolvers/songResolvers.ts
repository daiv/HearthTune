import { protect } from "../../middleware/protect";
import { MusicContext } from "../context.types";

export const songResolvers = {
  Query: {
    search: protect<undefined, MusicContext, { query: string, limit?: number }>(
      async (_parent, { query, limit }, context) => {
        return await context.services.songs.search(query, limit || 50);
      }
    ),
    getRelated: protect<undefined, MusicContext, { id: string, numberOfSongs: number }>(
      async (_parent, { id, numberOfSongs }, context) => {
        return await context.services.songs.getRelatedSongs(id, numberOfSongs);
      }
    ),
  }
};