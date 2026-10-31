import { Playlist } from "@/common/types";
import { useGraphQl } from "./useGraphql";
import { GET_PLAYLISTS } from "@/graphql/queries";
import { useGraphQlMutation } from "./useGraphQlMutation";
import { REMOVE_PLAYLIST_MUTATION, SAVE_PLAYLIST_MUTATION } from "@/graphql/mutations";

export function useGetPlaylists() {
  const hook = useGraphQl<{ getPlaylistsByUserId: Playlist[] }>(
    GET_PLAYLISTS,
  );
  return { ...hook, data: hook.data?.getPlaylistsByUserId || [] };
}

export function useSavePlaylist() {
  return useGraphQlMutation<
    { savePlaylist: Playlist },
    { id?: string, title: string, songs?: string[] }>(
      SAVE_PLAYLIST_MUTATION,
      [GET_PLAYLISTS]
    )
}
export function useRemovePlaylist() {
  return useGraphQlMutation<
    { removePlaylist: boolean },
    { id: string }>(
      REMOVE_PLAYLIST_MUTATION,
      [GET_PLAYLISTS]
    )
}
