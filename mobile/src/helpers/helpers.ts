import { Song } from "@/common/types";
import { SERVER_URL } from "@env";
import { Track } from "react-native-track-player";
import { DeviceInfo } from 'react-native-device-info';

export const songToTrack = (song: Song): Track => {
  const songWithInstance = song.instanceId ? song : addInstanceId(song);
  const track: Track = {
    id: song.id,
    title: song.title,
    url: song.url || 'empty',
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
    provider: 'Youtube',
    url: track.url
  }
  const songWithInstanceId = song.instanceId ? song : addInstanceId(song);
  return songWithInstanceId;
}

export const formatTime = (durationInSeconds: number): string => {
  const minutes = Math.floor(durationInSeconds / 60);
  const seconds = Math.floor(durationInSeconds % 60);
  const formattedTime = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  return formattedTime;
}

export const addInstanceId = (song: Song): Song => {
  const instanceId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  return { ...song, instanceId };
}

export const checkEmail = (email: string): string => /^\S+@\S+\.\S+$/.test(email) ? '' : 'email format not valid';

export const checkMainPwd = (pwd: string): string => {
  if (!pwd || pwd.length === 0) return 'password can not be empty';
  return pwd.length > 8 ? '' : 'password is too short';
};

export const checkMatchingPwd = (pass: string) => (pass2: string): string => pass === pass2 ? '' : 'passwords does not match';

export const checkNick = (nick: string): string => nick && nick.length > 3 ? '' : 'nick is too short';

export const getDeviceInfo = (): string => {
  const brand = DeviceInfo.getBrand();
  const model = DeviceInfo.getModel()
  const apiLevel = DeviceInfo.getApiLevelSync();
  const appVersion = DeviceInfo.getVersion();
  return `${brand} ${model} ${apiLevel} ${appVersion}`;
}
