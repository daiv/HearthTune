import { Readable } from "node:stream";
import { ISongService } from "../interfaces/ISongService";
import { AuthService, UserService } from "@/services";

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
  user?: User;
  services: {
    songs: ISongService;
    user: UserService;
    auth: AuthService;
  }
}

export type Credential = {
  token: string;
  expiresAt: Date;
}
export type User = {
  id: string;
  nick?: string;
  email: string;
  password?: string;
  status: UserStatus;
  role: Role;
  credentials?: Credential;
  activatedAt?: Date;
  createdAt?: Date;
}

type MongoUserExtraFields =
  {
    _id: string;
    emailHash: string;
    __v: number;
    __enc_email: boolean;
  };

export type MongoUser = User & MongoUserExtraFields;
export type CreateUserDto = {
  email: string;
  role?: Role;
  password?: string;
  nick?: string;
}
export type Role = 'superAdmin' | 'admin' | 'user' | 'basic';
export type TimeUnit = 'days' | 'hours' | 'minutes';

export type UserStatus =
  'whiteListed' |
  'verification_pending' |
  'invitation_expired' |
  'new_invitation_requested' |
  'active' |
  'banned';

export type UserCredential = {
  id?: string;
  credentials?: Credential
}
export type IsTokenLegitResponse = UserCredential & { valid: true, } | { valid: false, cause: 'invalid token' | 'token expired' };
export type MailOptions = {
  from: string;
  to: string;
  subject: string;
  html: string;
};
export type AuthPayload = {
  accessToken: string;
  refreshToken: string;
}

export type AccessPayload = {
  userId: string;
  jti: string;
  role: Role;
}

export type Session = {
  userId: string;
  JTI: string;
  role: Role;
  deviceInfo?: string;
}