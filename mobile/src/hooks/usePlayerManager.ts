import { Playlist, Song } from "@/common/types";
import { addInstanceId, songToTrack, trackToSong } from "@/helpers/helpers";
import { getRelatedSongsFromServer, getSignedUrlService } from "@/services";
import TrackPlayer, { Event, Track, useTrackPlayerEvents } from "react-native-track-player";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PlayListContextData } from "@/types/types";
import { useQueryClient } from "@tanstack/react-query";

export const usePlayerManager = () => {
  const [queue, setQueue] = useState<Song[]>([]);
  const [activePlaylist, setActivePlaylist] = useState<{ id: string, title: string } | null>(null);
  const queueRef = useRef<Song[]>([]);
  const relatedCandidatesRef = useRef<Song[]>([]);
  const isLastSongRef = useRef<boolean>(false);
  const isCurrentTrackBeyondMiddlePointRef = useRef<boolean>(false);
  const isSongAdditionTrigeredRef = useRef<boolean>(false);
  const isSyncingRef = useRef<boolean>(false);
  const songIndexRef = useRef<number>(0);
  const pauseAutoQueueRef = useRef<boolean>(false);
  const isShufflingRef = useRef<boolean>(false);
  const isSongUpdatedToLocal = useRef<boolean>(false);

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

  const setDownloadStatusToReady = (): void => {
    console.log('setting queue to local');
    isSongUpdatedToLocal.current = true;
    const instanceId = queueRef.current[songIndexRef.current].instanceId;
    console.log('instanceid is', instanceId);
    if (!instanceId) console.error(' no instance id');
    const newQueue: Song[] = queueRef.current.map((s: Song) => s.instanceId !== instanceId ? s : ({ ...s, downloadStatus: "Ready" }));
    queueRef.current[songIndexRef.current].downloadStatus = "Ready";
    const currentSong = queueRef.current[songIndexRef.current];
    console.log('song', currentSong);
    setQueue(q => newQueue);
  }

  const manageSongStatus = () => {
    const needConvertToLocal = queueRef.current[songIndexRef.current].downloadStatus !== "Ready" && !isSongUpdatedToLocal.current && isCurrentTrackBeyondMiddlePointRef.current;
    if (needConvertToLocal)
      setDownloadStatusToReady();
  }
  useTrackPlayerEvents(
    [
      Event.PlaybackProgressUpdated,

    ], async event => {
      const { position, duration } = event;
      await manageAutoQueue(position, duration);
      manageSongStatus();
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
      isSongUpdatedToLocal.current = false;
      const activeIndex = event.index ?? await TrackPlayer.getActiveTrackIndex();
      songIndexRef.current = activeIndex || 0;
      isLastSongRef.current = queueRef.current.length - 1 === songIndexRef.current;

      isSongAdditionTrigeredRef.current = isCurrentTrackBeyondMiddlePointRef.current = false;

      console.log('playing id ', queueRef.current[songIndexRef.current]?.id);
      console.log('songIndex', songIndexRef.current);
      if (!activeIndex || activeIndex >= queueRef.current.length) return;

      if (!isLastSongRef.current) await signTrackAtPosition(activeIndex + 1);
    });

  const manageAutoQueue = async (position: number, duration: number): Promise<void> => {
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

  const signTrackAtPosition = async (position: number): Promise<void> => {
    if (position >= queueRef.current.length) return;

    const currentSong = queueRef.current[position];

    if (currentSong.url && currentSong.url !== 'empty') return;

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

  const enqueue = useCallback(async (song: Song, addedManually: boolean = true): Promise<void> => {
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

  const loadSongs = useCallback(async (songs: Song[]): Promise<void> => {
    await TrackPlayer.reset();
    const songsWithInstanceId = songs.map(addInstanceId);
    const songsToSign = songs.length > 2 ? 2 : songs.length;
    if (songsToSign > 0) {
      for (let i = 0; i < songsToSign; i++) {
        const signedSong = await updateSongWithSignedUrl(songsWithInstanceId[i]);
        songsWithInstanceId[i] = signedSong;
      }
    }
    await TrackPlayer.add(songsWithInstanceId.map(songToTrack));
    queueRef.current = [...songsWithInstanceId];
    setQueue(songsWithInstanceId);
  }, [queueRef]);

  const unloadPlaylist = useCallback(async (): Promise<void> => {
    await TrackPlayer.reset();
    queueRef.current = [];
    songIndexRef.current = 0;
    setActivePlaylist(null);
    setQueue([]);
  }, []);

  const pauseAutoQueue = useCallback((enabled: boolean): void => {
    pauseAutoQueueRef.current = enabled;
  }, []);

  const enqueueRelatedSong = useCallback(async (isRetry = false): Promise<void> => {
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

  const skipToByInstanceId = useCallback(async (instanceId: string): Promise<void> => {
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

  const dequeue = useCallback(async (instanceId: string): Promise<void> => {
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

  const shuffleQueue = useCallback(async (): Promise<void> => {
    if (isShufflingRef.current) return;
    isShufflingRef.current = true;
    const newQueue = [...queueRef.current];
    for (let i = newQueue.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newQueue[i], newQueue[j]] = [newQueue[j], newQueue[i]];
    }
    await loadSongs(newQueue);
    songIndexRef.current = 0;
    isLastSongRef.current = newQueue.length === 1;
    isSongAdditionTrigeredRef.current = false;
    isShufflingRef.current = false;
  }, [loadSongs]);

  const isCurrentTrackLocal = (): boolean => {
    const currentIndex = songIndexRef.current;

    if (queueRef.current.length === 0 ||
      currentIndex === undefined ||
      currentIndex < 0 ||
      currentIndex >= queueRef.current.length) return false;

    return queueRef.current[songIndexRef.current].downloadStatus == "Ready" || false;
  };

  const skipSong = useCallback(async (to: 'Prev' | 'Next'): Promise<void> => {
    const length = queueRef.current.length;
    const currentIndex = songIndexRef.current;
    if (length === 0 ||
      (to === 'Next' && currentIndex >= length - 1) ||
      (to === 'Prev' && currentIndex === 0)
    ) return;

    try {
      const targetIndex = to === 'Next' ? currentIndex + 1 : currentIndex - 1;
      const targetSong = queueRef.current[targetIndex];
      const isSongUnsigned = !targetSong.url || targetSong.url === 'empty';
      if (isSongUnsigned) await signTrackAtPosition(targetIndex);

      if (to === 'Next')
        await TrackPlayer.skipToNext();
      else
        await TrackPlayer.skipToPrevious();

      songIndexRef.current = targetIndex;

    } catch (error) {
      songIndexRef.current = currentIndex;
    }

  }, []);

  const loadPlaylist = useCallback(async (playlist: Playlist<Song>) => {
    const { id, title, songs } = playlist;
    if (!id || !songs) return;
    await loadSongs(songs);
    console.log('lennnn', queueRef.current.length);
    console.log('index', songIndexRef.current);
    setActivePlaylist({ id, title });
  }, [loadSongs]);

  const moveQueueItem = useCallback(async (pos: number, to: 'up' | 'down') => {
    const length = queueRef.current.length;

    if (pos === 0 && to === 'up'
      || pos >= length
      || pos === length - 1 && to === 'down'
    ) return;
    const finalPosition = to === 'up' ? (pos - 1) : (pos + 1);
    const newQueue = [...queueRef.current];

    const temp = newQueue[finalPosition];
    newQueue[finalPosition] = newQueue[pos];
    newQueue[pos] = temp;
    queueRef.current = newQueue;
    await TrackPlayer.move(pos, finalPosition);
    songIndexRef.current = await TrackPlayer.getActiveTrackIndex() ?? 0;
    setQueue(newQueue);
  }, []);

  const contextValue: PlayListContextData = useMemo(() => ({
    queue,
    activePlaylist,
    enqueue,
    dequeue,
    skipToByInstanceId,
    enqueueRelatedSong,
    loadSongs,
    loadPlaylist,
    unloadPlaylist,
    pauseAutoQueue,
    shuffleQueue,
    isCurrentTrackLocal,
    skipSong,
    setActivePlaylist,
    moveQueueItem

  }), [
    queue,
    activePlaylist,
    enqueue,
    dequeue,
    skipToByInstanceId,
    enqueueRelatedSong,
    loadSongs,
    loadPlaylist,
    unloadPlaylist,
    pauseAutoQueue,
    shuffleQueue,
    moveQueueItem,
    skipSong]);
  return contextValue;
}