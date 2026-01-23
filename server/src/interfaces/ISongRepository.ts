import { DownloadStatus, Song } from "@/common/types";
import { DeleteResult, Document, UpdateWriteOpResult } from "mongoose";

export interface ISongRepository {
  save
    (
      song: Song
    )
    : Promise<Document>;

  exists
    (
      id: string
    )
    : Promise<boolean>;

  delete
    (
      id: string
    )
    : Promise<DeleteResult>;

  addOneMorePlayed
    (
      id: string
    )
    : Promise<UpdateWriteOpResult>;

  isReady
    (
      id: string
    ): Promise<boolean>;

  setSongState
    (id: string,
      status: DownloadStatus
    )
    : Promise<boolean>;

  getSongDetails
    (
      id: string
    )
    : Promise<Song | null>;

  delete(id: string): Promise<DeleteResult>;
}

