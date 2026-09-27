import { Song } from "@/common/types";
import { gqlManager } from "@/graphql/GraphQLClientManager"
import { TOGGLE_MUTATION } from "@/graphql/mutations"
import { IS_LIKED, LIKED_LIST } from "@/graphql/queries";

export const toggleLike = async (songId: string): Promise<boolean> => {
  const isNowLiked = await gqlManager.safeRequest<{ toggleLikeSong: boolean }>(TOGGLE_MUTATION,
    { songId });
  return isNowLiked.toggleLikeSong;
}

export const isLiked = async (songId: string): Promise<boolean> => {
  const response = await gqlManager.safeRequest<{ isLiked: boolean }>(IS_LIKED, { songId });
  return response.isLiked;
}
export const getLiked = async (): Promise<Song[]> => {
  const likedList = await gqlManager.safeRequest<Song[]>(LIKED_LIST, {});
  return likedList;
}