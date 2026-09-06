import { Readable } from "node:stream";
import { ISongService } from "../interfaces/ISongService";
import { AuthService, UserService } from "@/services";
import { Song } from "@/common/types";

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
  };
  metadata: {
    deviceInfo: string;
    appVersion: string;
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
export type Role = 'superAdmin' | 'admin' | 'user' | 'basic' | 'test';
export type RolePermission = Record<Role, number>;
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


export type AccessPayload = {
  userId: string;
  jti: string;
  role: Role;
}

export type Session = {
  userId: string;
  JTI: string;
  role: Role;
  deviceId: string,
  deviceInfo?: string;
}

export type SearchResult = {
  localSearch: Song[];
  deepSearch: Promise<Song[]>;
}
export type SearchQueryPayload = {
  localSearch: Pick<SearchResult, 'deepSearch'>;
  query: string;
  limit?: number;
}
export type ProtectOptions = {
  sanitizeQuery?: boolean
}
export type SignedUrlValidationParams = {
  songId: string;
  provider: string;
  userId: string;
  expiresAt: string;
  sign: string;
}
export type SsrLoginResponse =
  {
    success: true
  } |
  {
    success: false,
    errors: {
      general: string,
      email: string,
      password: string,
    }
  }

export type EjsOptions = {
  fields: {};
  errors?: {};
  action: string;
  events?: {
    onSuccess?: () => void;
    onError?: () => void;
  };
}
export type EjsView = |
  'authenticate' |
  'createAccount' |
  'dashboard' |
  'downloadLogin' |
  'errors' |
  'linkRequested' |
  'success' |
  'welcome';

export interface BaseProps {
  title: string
}
export interface LoginProps extends BaseProps {
  buttonText: string;
  errors?: {
    email?: string;
    password?: string;
    general?: string;
  };
  email?: string;
  action: string;
}
export interface action {
  name: string;
  url: string;
}
export interface DashboardProps extends BaseProps {
  actions: action[];
}
export type ViewPropsMap = {
  'authenticate': LoginProps
  'dashboard': DashboardProps
}
export type ViewPath = keyof ViewPropsMap;


