import { Playlist } from "@/types/types";
import { DeletePlaylistContext, GetPlaylistsContext, GetSongsContext, SavePlaylistContext } from "../context.types";
import { protect } from "@/middleware";
import { atLeast } from "@/helpers";

export const playlistResolvers = {
  Query: {
    getPlaylistsByUserId: protect<undefined, GetPlaylistsContext, {}>(
      atLeast('basic'),
      async (_, { }, context) => {
        if (!context.user) return [];
        return context.services.playlist?.getPlaylistsByUserId(context.user.id)
      }
    ),
    getPlaylistById: protect<undefined, GetPlaylistsContext, { id: string }>(
      atLeast('basic'),
      async (_, { id }, context) => {
        return context.services.playlist?.getPlaylistById(id, context.user!.id);
      }
    ),
  }
  ,
  Mutation: {
    savePlaylist: protect<undefined, SavePlaylistContext, { id?: string; title: string, songs: string[] }>(
      atLeast('basic'),
      async (_, { id, title, songs }, context) => {
        if (!title || !songs) return null;

        const response = await context.services.playlist?.savePlaylist({ id, songs, title, userId: context.user?.id! }, context.user?.id!, context.user?.role!);
        return response;
      }),

    removePlaylist: protect<undefined, DeletePlaylistContext, { id: string }>(
      atLeast('basic'),
      async (_, { id }, context) => {
        const response = await context.services.playlist?.removePlaylist(id, context.user!.id);
        return Boolean(response);
      }
    )
  }
  ,
  Playlist: {
    songs: async (playlist: Playlist, _: {}, context: GetSongsContext) => {
      if (!playlist.songs || playlist.songs.length === 0) return [];
      return await context.services.song.getSongsByIds(playlist.songs);
    }
  }
}