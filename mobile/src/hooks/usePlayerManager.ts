import { Song } from "@/common/types";
import { addInstanceId, songToTrack, trackToSong } from "@/helpers/helpers";
import { getRelatedSongsFromServer } from "@/services/musicService";
import TrackPlayer, { Event, Track, useTrackPlayerEvents } from "react-native-track-player";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PlayListContextData } from "@/types/types";
import { getSignedUrlService } from "@/services/authService";
import { useQueryClient } from "@tanstack/react-query";

export const usePlayerManager = () => {
  const [queue, setQueue] = useState<Song[]>([]);

  const queueRef = useRef<Song[]>([]);
  const relatedCandidatesRef = useRef<Song[]>([]);
  const isLastSongRef = useRef(false);
  const isCurrentTrackBeyondMiddlePointRef = useRef(false);
  const isSongAdditionTrigeredRef = useRef(false);
  const isSyncingRef = useRef(false);
  const songIndexRef = useRef(0);
  const pauseAutoQueueRef = useRef(false);
  const isShufflingRef = useRef(false);

  const queryClient = useQueryClient();

  const syncQueue = useCallback(async () => {
    if (isSyncingRef.current) return;

    isSyncingRef.current = true;
    try {
      const [tracks, currentSongIndex] = await Promise.all(
        [
          TrackPlayer.getQueue(),
          TrackPlayer.getActiveTrackIndex()
        ]);

      const songs: Song[] = tracks.map(trackToSong);

      queueRef.current = songs;
      setQueue([...queueRef.current]);
      if (currentSongIndex !== undefined) songIndexRef.current = currentSongIndex;
    } catch (error) {
      console.error('error syncing queue', error);
    } finally {
      isSyncingRef.current = false;
    }

  }, []);

  useEffect(() => { syncQueue() }, []);

  useTrackPlayerEvents(
    [
      Event.PlaybackProgressUpdated,

    ], async event => {
      const { position, duration } = event;
      await manageAutoQueue(position, duration);
    }
  );

  useTrackPlayerEvents(
    [Event.PlayerError, Event.PlaybackError],

    async function logErrors(event) {
      console.error('player error', event);
      const activeTrack = await TrackPlayer.getActiveTrack();
      console.log('activeTrack is', activeTrack);
    }
  );

  useTrackPlayerEvents(

    [Event.PlaybackActiveTrackChanged],

    async function updateRefsAndTrigerTracksSignature(event) {
      const activeIndex = event.index ?? await TrackPlayer.getActiveTrackIndex();
      songIndexRef.current = activeIndex || 0;
      isLastSongRef.current = queueRef.current.length - 1 === songIndexRef.current;

      isSongAdditionTrigeredRef.current = isCurrentTrackBeyondMiddlePointRef.current = false;

      console.log('playing id ', queueRef.current[songIndexRef.current]?.id);
      console.log('songIndex', songIndexRef.current);
      if (!activeIndex || activeIndex >= queueRef.current.length) return;

      if (!isLastSongRef.current) await signTrackAtPosition(activeIndex + 1);
    });


  const manageAutoQueue = async (position: number, duration: number) => {
    if (pauseAutoQueueRef.current || !isLastSongRef.current || !position || duration <= 0) return;

    isCurrentTrackBeyondMiddlePointRef.current = (duration / 2) < position;

    if (isCurrentTrackBeyondMiddlePointRef.current && !isSongAdditionTrigeredRef.current) {
      isSongAdditionTrigeredRef.current = true;
      try {
        await enqueueRelatedSong();
      } catch (error) {
        isSongAdditionTrigeredRef.current = false;
        console.error(error);
      }
    }
  }

  const signTrackAtPosition = async (position: number) => {
    if (position >= queueRef.current.length) return;

    const signedSong: Song = await updateSongWithSignedUrl(queueRef.current[position]);

    const signedTrack: Track = songToTrack(signedSong);

    queueRef.current = queueRef.current.toSpliced(position, 1, signedSong);
    await TrackPlayer.remove([position]);
    await TrackPlayer.add(signedTrack, position);
  }

  const updateSongWithSignedUrl = async (song: Song): Promise<Song> => {
    const signedUrlData = await queryClient.ensureQueryData({
      queryKey: ['signedUrl', song.id, song.provider],
      queryFn: () => getSignedUrlService(song.id, song.provider),
      staleTime: 25 * 60 * 1000,
    });
    return {
      ...song,
      url: signedUrlData?.signedUrl || ''
    };
  };

  const enqueue = useCallback(async (song: Song, addedManually: boolean = true) => {
    if (addedManually) relatedCandidatesRef.current = [];
    const songWithInstance = addInstanceId(song);
    console.log('added song', songWithInstance);
    const queueLength = queueRef.current.length;
    try {
      const songReadyToAdd = (queueLength < 3) || !addedManually || songIndexRef.current === queueLength ?
        await updateSongWithSignedUrl(songWithInstance)
        : songWithInstance;
      await TrackPlayer.add(songToTrack(songReadyToAdd));
      const nextQueue = [...queueRef.current, songReadyToAdd];
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
    await signTrackAtPosition(0);
    setQueue(newQueue);
  }, [queueRef]);

  const resetQueue = useCallback(async () => {
    await TrackPlayer.reset();
    queueRef.current = [];
    songIndexRef.current = 0;
    setQueue([]);
  }, []);

  const pauseAutoQueue = useCallback((enabled: boolean) => {
    pauseAutoQueueRef.current = enabled;
  }, []);

  const enqueueRelatedSong = useCallback(async (isRetry = false) => {
    const currentSong = queueRef.current[songIndexRef.current];
    if (!currentSong) return;

    if (relatedCandidatesRef.current.length > 0) {
      const candidateIndex = relatedCandidatesRef.current.findIndex(
        candidate => !queueRef.current.some(song => song.id === candidate.id)
      );
      if (candidateIndex !== -1) {
        const [songToAdd] = relatedCandidatesRef.current.splice(candidateIndex, 1);
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
      relatedCandidatesRef.current = relatedSongs.filter(song => song.id !== songToAdd.id);
    } else if (!isRetry) {
      const lastSong = queueRef.current[queueRef.current.length - 1];
      if (lastSong) {
        const relatedToLastSong = await getRelatedSongsFromServer(lastSong.id, 15);
        if (relatedToLastSong && relatedToLastSong.length > 0) {
          relatedCandidatesRef.current = relatedToLastSong;
          await enqueueRelatedSong(true);
        }
      }
    }
  }, [enqueue]);

  const skipToByInstanceId = useCallback(async (instanceId: string) => {
    if (!instanceId) {
      console.log('bad instance Id');
      syncQueue();
      return;
    }

    const index = queueRef.current.findIndex(song => song.instanceId === instanceId);

    if (index !== -1) {
      songIndexRef.current = index;
      await signTrackAtPosition(index);
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
      isLastSongRef.current = (currentIndex === updatedQueue.length - 1);

    } catch (error) {
      console.error('error removing song', error);
    }
  }, []);

  const shuffleQueue = useCallback(async () => {
    if (isShufflingRef.current) return;
    isShufflingRef.current = true;
    const newQueue = [...queueRef.current];
    for (let i = newQueue.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newQueue[i], newQueue[j]] = [newQueue[j], newQueue[i]];
    }
    await loadPlayList(newQueue);
    songIndexRef.current = 0;
    isLastSongRef.current = newQueue.length === 1;
    isSongAdditionTrigeredRef.current = false;
    isShufflingRef.current = false;
  }, [loadPlayList]);

  const isCurrentTrackLocal = (): boolean => {
    const currentIndex = songIndexRef.current;

    if (queueRef.current.length === 0 ||
      currentIndex === undefined ||
      currentIndex < 0 ||
      currentIndex >= queueRef.current.length) return false;

    return queueRef.current[songIndexRef.current].local || false;
  };

  const skipSong = useCallback(async (to: 'Prev' | 'Next') => {
    const length = queueRef.current.length;
    const currentIndex = songIndexRef.current;
    if (length === 0 ||
      (to === 'Next' && currentIndex >= length - 1) ||
      (to === 'Prev' && currentIndex === 0)
    ) return;
    try {
      if (to === 'Next') {
        if (queueRef.current[currentIndex + 1].url === 'empty') signTrackAtPosition(currentIndex + 1);
        await TrackPlayer.skipToNext();
        songIndexRef.current = currentIndex + 1;
      } else {
        if (queueRef.current[currentIndex - 1].url === 'empty') signTrackAtPosition(currentIndex - 1);
        await TrackPlayer.skipToPrevious();
        songIndexRef.current = currentIndex - 1;
      }
    } catch (error) {
      songIndexRef.current = currentIndex;
    }

  }, []);
  const contextValue: PlayListContextData = useMemo(() => ({
    queue,
    enqueue,
    dequeue,
    skipToByInstanceId,
    enqueueRelatedSong,
    loadPlayList,
    resetQueue,
    pauseAutoQueue,
    shuffleQueue,
    isCurrentTrackLocal,
    skipSong
  }), [queue, enqueue, dequeue, skipToByInstanceId, enqueueRelatedSong, loadPlayList, resetQueue, pauseAutoQueue, shuffleQueue]);
  return contextValue;
}