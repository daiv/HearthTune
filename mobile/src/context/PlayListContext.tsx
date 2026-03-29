import { Song } from "@/common/types";
import { GET_RELATED_SONGS } from "@/graphql/queries";
import { PlayListContextData } from "@/types/types";
import { GRAPHQL_API_URL, SERVER_URL } from "@env";
import request from "graphql-request";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import TrackPlayer, { Event, useTrackPlayerEvents } from "react-native-track-player";

const PlayListContext = createContext<PlayListContextData | null>(null);

export const usePlayListContext = () => {
  const context = useContext(PlayListContext);
  if (context === null)
    throw new Error('usePlayListContext must be used whithine a PlayListProvider');
  return context;
};

export const PlayListProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [playList, setPlayList] = useState<Song[]>([]);
  const playListRef = useRef<Song[]>([]);
  const isLastSong = useRef(false);
  const isCurrentTrackBeyondMiddlePoint = useRef(false);
  const isSongAdditionTrigered = useRef(false);
  const isAutoSongAdditionModeEnabled = useRef(true);
  const songIndex = useRef(0);

  const sync = useCallback(() => {
    const songs: Song[] = [];
    TrackPlayer.getQueue()
      .then(tracks => {
        tracks.forEach(track => {
          const song: Song = {
            title: track.title!,
            duration: track.duration || 0,
            id: track.mediaId!,
            description: track.description || ''
          }
          songs.push(song);
        });
        playListRef.current = songs;
        setPlayList(playListRef.current);
      })
      .catch(console.log);
  }, []);

  useEffect(sync, []);

  useTrackPlayerEvents(
    [
      Event.PlaybackProgressUpdated,
      Event.PlaybackActiveTrackChanged
    ], async event => {
      switch (event.type) {
        case Event.PlaybackActiveTrackChanged:
          const queue = await TrackPlayer.getQueue();
          const activeIndex = await TrackPlayer.getActiveTrackIndex();
          songIndex.current = activeIndex ?? (queue.length > 0 ? 0 : -1);
          console.log('queue length', queue.length);
          console.log('index', songIndex.current);
          isLastSong.current = queue.length - 1 === songIndex.current;
          isSongAdditionTrigered.current = false;
          isCurrentTrackBeyondMiddlePoint.current = false;
          console.log('playing id ', playListRef.current[songIndex.current].id);
          console.log('songIndex', songIndex.current);
          break;

        case Event.PlaybackProgressUpdated:
          if (!isAutoSongAdditionModeEnabled.current || !isLastSong.current) return;
          const { position, duration } = event;
          if (!position || duration <= 0) return;
          isCurrentTrackBeyondMiddlePoint.current = (duration / 2) < position;

          if (isCurrentTrackBeyondMiddlePoint.current && !isSongAdditionTrigered.current) {
            isSongAdditionTrigered.current = true;
            try {
              addRelatedSongToQueue();
            } catch (error) {
              isSongAdditionTrigered.current = false;
              console.error(error);
            }
          }
          break;
      }
    });

  const getRelatedSongsFromServer = async (id: string): Promise<Song[] | undefined> => {
    const data = await request<{ getRelated: Song[] }>(
      GRAPHQL_API_URL,
      GET_RELATED_SONGS,
      { id, numberOfSongs: 1 }
    );
    console.log('the id asked for to the server is', id);
    return data?.getRelated;
  }

  const addSong = useCallback((song: Song, addedManually: boolean = true) => {
    const songWithInstance = { ...song, addedManually, instanceId: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}` }
    if (playListRef.current.length !== 0) isLastSong.current = false;
    playListRef.current = [...playListRef.current, songWithInstance];
    setPlayList(playListRef.current);
    TrackPlayer.add({
      id: song.id,
      title: song.title,
      url: SERVER_URL + song.id,
      mediaId: songWithInstance.instanceId
    });
  }, []);

  const addSongIfNew = useCallback((songs: Song[]): boolean => {
    for (const seed of songs) {
      if (!playListRef.current.some(s => s.id === seed.id)) {
        console.log('adding related', seed.title);
        addSong(seed, false);
        return true;
      } else console.log(`skipping ${seed.title} already in list`);
    }
    return false;
  }, [addSong]);

  const addRelatedSongToQueue = useCallback(async () => {
    const list = playListRef.current;
    const index = songIndex.current;
    const currentSong = list[index];
    if (!currentSong) return;

    const relatedSongs = await getRelatedSongsFromServer(currentSong.id);
    if (!relatedSongs || relatedSongs.length === 0) return;
    let isSongAdded: boolean = false;

    isSongAdded = addSongIfNew(relatedSongs);

    if (!isSongAdded) {
      console.log('All related songs from server were duplicated, looking for more...');

      for (const relatedSong of relatedSongs) {
        try {
          const moreRelatedSongs = await getRelatedSongsFromServer(relatedSong.id) || [];
          isSongAdded = addSongIfNew(moreRelatedSongs);
          if (isSongAdded) break;

        } catch (error) {
          console.error(`error getting relateds from ${relatedSong.title}`)
        }
      }
    }
    if (!isSongAdded) console.error('unable to get new songs from server. All attemps returned duplicateds')
  }, [addSong, addSongIfNew]);



  const skipToByInstanceId = useCallback((instanceId: string) => {
    if (!instanceId) {
      console.log('bad instance Id');
      sync();
      return;
    }

    const index = playList.findIndex(song => song.instanceId === instanceId);
    if (index !== -1) {
      TrackPlayer.skip(index);
    }
    else {
      console.warn('bad index');
      sync();
    }
  }, [playList]);

  const removeSongByInstanceId = useCallback(async (id: string) => {
    const indexToRemove = playList.findIndex(song => song.instanceId === id);
    if (indexToRemove === -1) {
      sync();
      return;
    }
    try {
      await TrackPlayer.remove(indexToRemove);
      setPlayList(currentList => currentList.filter(song => song.instanceId !== id));
    } catch (err) {
      console.error('Error removing song', err);
      sync();
    }
  }, [playList]);

  const contextValue = useMemo(() => ({
    playList,
    addSong,
    removeSongByInstanceId,
    isLastSong,
    addRelatedSongToQueue,
    skipToByInstanceId
  }), [playList, addSong, removeSongByInstanceId, addRelatedSongToQueue, skipToByInstanceId]);
  return (
    <PlayListContext.Provider value={contextValue}>{children}</PlayListContext.Provider>
  )
};