import { Playlist, Song } from "@/common/types";
import { gqlManager } from "@/graphql/GraphQLClientManager";
import { SAVE_PLAYLIST_MUTATION } from "@/graphql/mutations";
import { GET_PLAYLIST_BY_ID_WITH_SONGS, GET_PLAYLISTS } from "@/graphql/queries";

export const getPlaylists = async (): Promise<Playlist[]> => {
  const data = await gqlManager.safeRequest<{ getPlaylistsByUserId: Playlist[] }>(GET_PLAYLISTS, {});
  return data.getPlaylistsByUserId;
}
export const savePlaylist = async (title: string, songs: string[], id?: string): Promise<Playlist> => {
  const data = await gqlManager.safeRequest<{ savePlayList: Playlist }>(SAVE_PLAYLIST_MUTATION,
    {
      id, title, songs
    });
  return data.savePlayList;
}
export const getSongsFromPlaylistId = async (id: string): Promise<Playlist<Song>> => {
  const data = await gqlManager.safeRequest<{ getPlaylistById: Playlist<Song> }>(
    GET_PLAYLIST_BY_ID_WITH_SONGS,
    { id }
  );
  console.log('data is ', data);
  return data.getPlaylistById || [];
}