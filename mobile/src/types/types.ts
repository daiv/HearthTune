import { Song } from "@/common/types"

export type PlayListContextData = {
  playList: Song[];
  addSong: (song: Song, addedManually?: boolean) => void;
  removeSongByInstanceId: (id: string) => void;
  addRelatedSong: (id: string) => void;
}