import { Song } from "@/common/types";
import { useGraphQl } from "@/hooks/useGraphql";
import { PlayListContextData } from "@/types/types";
import { SERVER_URL } from "@env";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import TrackPlayer from "react-native-track-player";


const PlayListContext = createContext<PlayListContextData | null>(null);

export const usePlayListContext = () => {
  const context = useContext(PlayListContext);
  if (context === null)
    throw new Error('usePlayListContext must be used whithine a PlayListProvider');
  return context;
};

export const PlayListProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [playList, setPlayList] = useState<Song[]>([]);
  const isLastSong = useRef(false);

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
        });
      })
      .catch(console.log);
  }, []);
  useEffect(sync, [sync]);

  const addSong = useCallback((song: Song, addedManually: boolean = true) => {
    const songWithInstance = { ...song, addedManually, instanceId: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}` }
    setPlayList(list => [...list, songWithInstance]);
    TrackPlayer.add({
      id: song.id,
      title: song.title,
      url: SERVER_URL + song.id,
      mediaId: songWithInstance.instanceId
    });
  }, []);
  const addRelatedSong = useCallback(() => {

    console.log('middle point reached all is working');
  }, []);

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

  const contextValue = { playList, addSong, removeSongByInstanceId, isLastSong, addRelatedSong };
  return (
    <PlayListContext.Provider value={contextValue}>{children}</PlayListContext.Provider>
  )
};