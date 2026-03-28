import { Song } from "@/common/types";
import { GET_RELATED_SONGS } from "@/graphql/queries";
import { PlayListContextData } from "@/types/types";
import { GRAPHQL_API_URL, SERVER_URL } from "@env";
import request from "graphql-request";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
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

  useEffect(() => {
    const setup = async () => {
      await TrackPlayer.updateOptions({
        progressUpdateEventInterval: 1
      });
    }
    setup();
  }, []);

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
          logRefs();
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
          if (Math.floor(position) % 5 === 0) logRefs();
          break;
      }
    });

  const logRefs = () => {
    console.log('---------------------------')
    console.log('ref', playListRef.current);
    console.log('islastSong', isLastSong.current);
    console.log('beyondMIddlePoint', isCurrentTrackBeyondMiddlePoint.current);
    console.log('isTrigered', isSongAdditionTrigered.current);
    console.log('automodeOn', isAutoSongAdditionModeEnabled.current);
  }

  const getRelatedSongFromServer = async (id: string): Promise<Song | undefined> => {
    const data = await request<{ getRelated: Song[] }>(
      GRAPHQL_API_URL,
      GET_RELATED_SONGS,
      { id, numberOfSongs: 1 }
    );
    console.log('the id asked for to the server is', id);
    return data?.getRelated[0];
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

  const addRelatedSongToQueue = useCallback(async () => {
    const list = playListRef.current;
    const index = songIndex.current;
    const currentSong = list[index];
    if (!currentSong) return;
    console.log('id to ask', currentSong.id);
    console.log('lenght list', list.length);
    let isSongAdded = false;
    let isSongRepeated = false;
    let attempts = 0;
    while (!isSongAdded && attempts < 5) {
      console.log('trying to add new song...');
      attempts++;
      try {
        const relatedSong = await getRelatedSongFromServer(currentSong.id);
        if (relatedSong) {
          isSongRepeated = playListRef.current.some(song => song.id === relatedSong.id);
          if (!isSongRepeated) {
            console.log('adding related ', relatedSong.title);
            addSong(relatedSong, false);
            isSongAdded = true;

          } else console.warn(`server returned ${relatedSong.title} but is already in list`);
        } else console.error('not related song found');

      } catch (error) {
        console.error('error asking server');
      }

    }
  }, [addSong]);


  const skipToByInstanceId = useCallback((instanceId: string) => {
    if (!instanceId) {
      console.log('bad instance Id');
      return;
    }

    const index = playList.findIndex(song => song.instanceId === instanceId);
    if (index !== -1) {
      TrackPlayer.skip(index);
    }
    else console.warn('bad index');
  }, [playList]);

  const removeSongByInstanceId = useCallback(async (id: string) => {
    const indexToRemove = playList.findIndex(song => song.instanceId === id);
    if (indexToRemove === -1) return;
    try {
      await TrackPlayer.remove(indexToRemove);
      setPlayList(currentList => currentList.filter(song => song.instanceId !== id));
    } catch (err) {
      console.error('Error removing song', err);
    }
  }, [playList]);

  const contextValue = {
    playList, addSong, removeSongByInstanceId, isLastSong, addRelatedSong: addRelatedSongToQueue
    ,
    skipToByInstanceId
  };
  return (
    <PlayListContext.Provider value={contextValue}>{children}</PlayListContext.Provider>
  )
};