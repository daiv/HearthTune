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
export type UserCredentials = {
  token: string;
  expiration: Date;
}
export type User = {
  id: string;
  nick?: string;
  email: string;
  password?: string;
  status: UserStatus;
  role: Role;
  credentials?: UserCredentials;
}
type MongoUserExtraFields =
  {
    _id: string;
    emailHash: string;
    __v: number;
    __enc_email: boolean;
  };

export type CreateUserDto = {
  email: string;
  role?: Role;
  password?: string;
  nick?: string;
}
export type MongoUser = User & MongoUserExtraFields;
export type Role = 'superAdmin' | 'admin' | 'user' | 'basic';
export type UserStatus =
  'whiteListed' |
  'email sent' |
  'waiting for account validation' |
  'allowed' |
  'banned';

