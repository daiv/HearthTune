import { Song } from "@/common/types";
import { safeRequest } from "@/graphql/client";
import { GET_RELATED_SONGS, SEARCH_SONGS } from "@/graphql/queries";

export const getRelatedSongsFromServer = async (id: string, count: number = 10): Promise<Song[] | undefined> => {
  const data = await safeRequest<{ getRelated: Song[] }>(
    GET_RELATED_SONGS,
    { id, numberOfSongs: count }
  );
  console.log('the id asked for to the server is', id);
  return data?.getRelated;
}
export const searchSongsFromServer = async (query: string): Promise<Song[]> => {
  const data = await safeRequest<{ search: Song[] }>(SEARCH_SONGS, { query });

  if (!data || !data.search) return [];

  return data.search;
}