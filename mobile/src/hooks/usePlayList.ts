import { Song } from "@/common/types";
import { useCallback, useState } from "react";
import TrackPlayer from "react-native-track-player";
import { SERVER_URL } from "@env";
export default function usePlayList() {

  const [playList, setPlayList] = useState<Song[]>([]);

  const syncSongs = useCallback(() => {
    console.log('Synchronizing...');
    const songs: Song[] = [];
    TrackPlayer.getQueue()
      .then(tracks => {
        console.log('number of tracks in queue', tracks.length);
        tracks.forEach(track => {
          const song: Song = {
            title: track.title || '',
            duration: track.duration || 0,
            id: track.mediaId || '',
            description: track.description || null
          }
          songs.push(song);
        });
        setPlayList(songs);
      })
      .catch(console.log);
  }, []);

  const addSong = useCallback((song: Song) => {
    setPlayList(list => [...list, song]);
    TrackPlayer.add({ title: song.title, url: SERVER_URL + song.id + '.m4a' });
  }, []);

  const removeSong = useCallback((songId: string) => {
    const position: number[] = [];
    setPlayList(list => list.filter((song, pos) => {
      const keep = song.id != songId
      if (!keep) position.push(pos);
      return keep;
    }));

    TrackPlayer.remove(position);

  }, []);

  const clearList = useCallback(() => setPlayList([]), []);

  return { playList, addSong, removeSong, clearList, syncSongs };

}