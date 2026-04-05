import { Song } from "@/common/types";
import { GET_RELATED_SONGS } from "@/graphql/queries";
import { GRAPHQL_API_URL } from "@env";
import request from "graphql-request";

export const getRelatedSongsFromServer = async (id: string, count: number = 10): Promise<Song[] | undefined> => {
  const data = await request<{ getRelated: Song[] }>(
    GRAPHQL_API_URL,
    GET_RELATED_SONGS,
    { id, numberOfSongs: count }
  );
  console.log('the id asked for to the server is', id);
  return data?.getRelated;
}