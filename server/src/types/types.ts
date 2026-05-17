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

export type User = {
  id: string;
  nick: string;
  email: string;
  password: string;
  status: UserStatus;
}
type MongoUserExtraFields =
  {
    _id: string;
    emailHash: string;
    __v: number;
    __enc_email: boolean;
  };

export type MongoUser = User & MongoUserExtraFields;
export type Role = 'admin' | 'user';
export type UserStatus =
  'whiteListed' |
  'allowed';

