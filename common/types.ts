export enum DownloadStatus {
  DownloadPending = "DownloadPending",
  Downloading = "Downloading",
  Ready = "Ready",
  Error = "Error",
}
export type Song = {
  id: string;
  title: string;
  duration: number;
  description: string | null;
  played?: number;
  lastPlayed?: Date;
  status?: DownloadStatus
};