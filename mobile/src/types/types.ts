import { Song } from "@/common/types"

export type PlayListContextData = {
  queue: Song[];
  enqueue: (song: Song, addedManually?: boolean) => Promise<void>;
  dequeue: (instanceId: string) => Promise<void>;
  enqueueRelatedSong: (isRetry?: boolean) => Promise<void>;
  skipToByInstanceId: (instanceId: string) => void;
  loadPlayList: (songs: Song[]) => void;
  resetQueue: () => void;
  pauseAutoQueue: (enabled: boolean) => void;
  shuffleQueue: () => Promise<void>;
}
export type PlayListControlProps = {
  enqueueRelatedSong: (isRetry?: boolean) => Promise<void>;
  resetQueue: () => void;
  savePlayList: () => void;
  showPanel: boolean;
  shuffleQueue: () => Promise<void>;
}
export type PlayListControlButton = {
  view: React.JSX.Element;
  onPress: () => Promise<void> | void;
}