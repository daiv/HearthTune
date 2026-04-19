import { Song } from "@/common/types";
import { addInstanceId, songToTrack, trackToSong } from "@/helpers/helpers";
import { getRelatedSongsFromServer } from "@/services/musicService";
import { PlayListContextData } from "@/types/types";
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
  const relatedCandidates = useRef<Song[]>([]);
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

      const songs: Song[] = tracks.map(trackToSong);

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
    if (addedManually) relatedCandidates.current = [];
    const songWithInstance = addInstanceId(song);

    console.log('added song', songWithInstance);

    try {
      await TrackPlayer.add(songToTrack(songWithInstance));
      const nextQueue = [...queueRef.current, songWithInstance];
      queueRef.current = nextQueue;
      setQueue(nextQueue);
    } catch (error) {
      console.error('error enqueuing song', error);
    }

  }, []);

  const loadPlayList = useCallback(async (songs: Song[]) => {
    await TrackPlayer.reset();
    await TrackPlayer.add(songs.map(songToTrack));
    const newQueue = [...songs];
    queueRef.current = newQueue;
    setQueue(newQueue);
  }, []);

  const enqueueRelatedSong = useCallback(async (isRetry = false) => {
    const currentSong = queueRef.current[songIndex.current];
    if (!currentSong) return;

    if (relatedCandidates.current.length > 0) {
      const candidateIndex = relatedCandidates.current.findIndex(
        candidate => !queueRef.current.some(song => song.id === candidate.id)
      );
      if (candidateIndex !== -1) {
        const [songToAdd] = relatedCandidates.current.splice(candidateIndex, 1);
        await enqueue(addInstanceId(songToAdd), false);
        return;
      }
    }

    const relatedSongs = await getRelatedSongsFromServer(currentSong.id, 15);

    const newRelatedSongIndex =
      relatedSongs?.findIndex(
        relSong => !queueRef.current.some(song => song.id === relSong.id)
      ) ?? -1;

    if (newRelatedSongIndex !== -1 && relatedSongs) {
      const songToAdd = relatedSongs[newRelatedSongIndex];
      await enqueue(songToAdd, false);
      relatedCandidates.current = relatedSongs.filter(song => song.id !== songToAdd.id);
    } else if (!isRetry) {
      const lastSong = queueRef.current[queueRef.current.length - 1];
      if (lastSong) {
        const relatedToLastSong = await getRelatedSongsFromServer(lastSong.id, 15);
        if (relatedToLastSong && relatedToLastSong.length > 0) {
          relatedCandidates.current = relatedToLastSong;
          await enqueueRelatedSong(true);
        }
      }
    }
  }, [enqueue]);

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