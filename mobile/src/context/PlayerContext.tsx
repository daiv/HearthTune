import { Song } from "@/common/types";
import { getRelatedSongsFromServer } from "@/services/musicService";
import { PlayListContextData } from "@/types/types";
import { SERVER_URL } from "@env";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import TrackPlayer, { Event, useTrackPlayerEvents } from "react-native-track-player";



const PlayerContext = createContext<PlayListContextData | null>(null);

export const usePlayListContext = () => {
  const context = useContext(PlayerContext);
  if (context === null)
    throw new Error('usePlayListContext must be used whithin a PlayListProvider');
  return context;
};

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [queue, setQueue] = useState<Song[]>([]);
  const queueRef = useRef<Song[]>([]);
  const isLastSong = useRef(false);
  const isCurrentTrackBeyondMiddlePoint = useRef(false);
  const isSongAdditionTrigered = useRef(false);
  const isAutoSongAdditionModeEnabled = useRef(true);
  const isSyncing = useRef(false);
  const songIndex = useRef(0);

  const syncQueue = useCallback(async () => {
    if (isSyncing.current) return;

    isSyncing.current = true;
    try {

      const [tracks, currentSongIndex] = await Promise.all(
        [
          TrackPlayer.getQueue(),
          TrackPlayer.getActiveTrackIndex()
        ]);

      const songs: Song[] = tracks.map(track => (
        {
          id: track.id,
          title: track.title!,
          duration: track.duration || 0,
          description: track.description ?? '',
          instanceId: track.mediaId ?? `B-plan${Math.random()}`,
        }
      ));

      queueRef.current = songs;
      setQueue([...queueRef.current]);
      if (currentSongIndex !== undefined) songIndex.current = currentSongIndex;
    } catch (error) {
      console.error('error syncing queue', error);
    } finally {
      isSyncing.current = false;
    }

  }, []);

  useEffect(() => { syncQueue() }, []);

  useTrackPlayerEvents(
    [
      Event.PlaybackProgressUpdated,

    ], async event => {

      if (!isAutoSongAdditionModeEnabled.current || !isLastSong.current) return;
      const { position, duration } = event;
      if (!position || duration <= 0) return;
      isCurrentTrackBeyondMiddlePoint.current = (duration / 2) < position;

      if (isCurrentTrackBeyondMiddlePoint.current && !isSongAdditionTrigered.current) {
        isSongAdditionTrigered.current = true;
        try {
          await enqueueRelatedSong();
        } catch (error) {
          isSongAdditionTrigered.current = false;
          console.error(error);
        }
      }
    }
  );

  useTrackPlayerEvents([Event.PlaybackActiveTrackChanged], async event => {
    const activeIndex = await TrackPlayer.getActiveTrackIndex();
    songIndex.current = activeIndex ?? 0;
    isLastSong.current = queueRef.current.length - 1 === songIndex.current;

    isSongAdditionTrigered.current = isCurrentTrackBeyondMiddlePoint.current = false;

    console.log('playing id ', queueRef.current[songIndex.current]?.id);
    console.log('songIndex', songIndex.current);
  });

  const enqueue = useCallback(async (song: Song, addedManually: boolean = true) => {
    const instanceId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const songWithInstance = { ...song, instanceId };
    const track = {
      id: song.id,
      title: song.title,
      url: SERVER_URL + song.id,
      mediaId: instanceId
    }
    try {
      await TrackPlayer.add(track);
      const nextQueue = [...queueRef.current, songWithInstance];
      queueRef.current = nextQueue;
      setQueue(nextQueue);
    } catch (error) {
      console.error('error enqueuing song', error);
    }

  }, []);

  const addSongIfNew = useCallback(async (songs: Song[]): Promise<boolean> => {
    for (const seed of songs) {
      if (!queueRef.current.some(s => s.id === seed.id)) {
        console.log('adding related', seed.title);
        await enqueue(seed, false);
        return true;
      } else console.log(`skipping ${seed.title} already in list`);
    }
    return false;
  }, [enqueue]);


  const enqueueRelatedSong = useCallback(async () => {
    const list = queueRef.current;
    const index = songIndex.current;
    const currentSong = list[index];
    if (!currentSong) return;

    const relatedSongs = await getRelatedSongsFromServer(currentSong.id, 15);
    if (!relatedSongs || relatedSongs.length === 0) return;

    let isSongAdded: boolean = false;

    isSongAdded = await addSongIfNew(relatedSongs);

    if (!isSongAdded) {
      console.log('All related songs from server were duplicated, looking for more...');
      const lastSong = queueRef.current[queueRef.current.length - 1];
      if (lastSong && lastSong.id) {

        const last = await getRelatedSongsFromServer(lastSong.id, 15);
        if (last) await addSongIfNew(last);
      }

    }
  }, [addSongIfNew]);



  const skipToByInstanceId = useCallback((instanceId: string) => {
    if (!instanceId) {
      console.log('bad instance Id');
      syncQueue();
      return;
    }

    const index = queueRef.current.findIndex(song => song.instanceId === instanceId);
    if (index !== -1) {
      TrackPlayer.skip(index);
    }
    else {
      console.warn('bad index');
      syncQueue();
    }
  }, [syncQueue]);

  const dequeue = useCallback(async (instanceId: string) => {
    const indexToRemove = queueRef.current.findIndex(s => s.instanceId === instanceId);
    if (indexToRemove === -1) return;
    try {
      await TrackPlayer.remove(indexToRemove);
      const updatedQueue = queueRef.current.filter(song => song.instanceId !== instanceId);
      queueRef.current = updatedQueue;
      setQueue(updatedQueue);
      const currentIndex = await TrackPlayer.getActiveTrackIndex();
      isLastSong.current = (currentIndex === updatedQueue.length - 1);

    } catch (error) {
      console.error('error removing song', error);
    }
  }, []);

  const contextValue = useMemo(() => ({
    queue,
    enqueue,
    dequeue,
    skipToByInstanceId,
    enqueueRelatedSong
  }), [queue, enqueue, dequeue, skipToByInstanceId, enqueueRelatedSong]);
  return (
    <PlayerContext.Provider value={contextValue}>{children}</PlayerContext.Provider>
  )
};