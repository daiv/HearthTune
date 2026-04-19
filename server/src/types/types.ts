import { Readable } from "node:stream";
import { ISongService } from "../interfaces/ISongService";

export type SongResponse = {
  type: "local",
  localPath: string
}
  |
{
  type: "external"
  stream: Readable,
};


export type resolverContext = {
  songService: ISongService;
}