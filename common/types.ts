export type DownloadStatus = 'DownloadPending' | 'Downloading' | 'Ready' | 'Error';

export type AuthPayload = {
  accessToken: string;
  refreshToken: string;
}

export type Song = {
  id: string;
  title: string;
  duration: number;
  description: string | null;
  played?: number;
  local?: boolean;
  provider: 'Soundcloud' | 'Youtube' | 'Unknown';
  url?: string;
  lastPlayed?: Date;
  downloadStatus?: DownloadStatus | undefined;
  instanceId?: string;
  addedManually?: boolean;
  requestedBy?: string;
};

export type SignedUrl = {
  signedUrl: string;
}
export type Playlist<T = string> = {
  id?: string;
  userId: string;
  title: string;
  songs?: T[];
}