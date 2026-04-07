import { Song } from "@/common/types"

export type PlayListContextData = {
  queue: Song[];
  enqueue: (song: Song, addedManually?: boolean) => Promise<void>;
  dequeue: (instanceId: string) => Promise<void>;
  enqueueRelatedSong: (isRetry?: boolean) => Promise<void>;
  skipToByInstanceId: (instanceId: string) => void;
}
export type PlayListControlProps = {
  enqueueRelatedSong: Function;
  savePlayList: Function;
  showPanel: boolean

}