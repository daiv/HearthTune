import { Song } from "@/common/types";
import { SERVER_URL } from "@env";
import { Track } from "react-native-track-player";

export const songToTrack = (song: Song): Track => {
  const songWithInstance = song.instanceId ? song : addInstanceId(song);

  const track: Track = {
    id: song.id,
    title: song.title,
    url: SERVER_URL + song.id,
    mediaId: songWithInstance.instanceId
  }
  return track;
}

export const trackToSong = (track: Track): Song => {
  const song: Song = {
    id: track.id,
    title: track.title!,
    duration: track.duration || 0,
    description: track.description ?? '',
    instanceId: track.mediaId,
  }
  const songWithInstanceId = song.instanceId ? song : addInstanceId(song);
  return songWithInstanceId;
}

export const addInstanceId = (song: Song): Song => {
  const instanceId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  return { ...song, instanceId };
}