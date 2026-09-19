import { Readable } from "node:stream";
import { ISongService } from "../interfaces/ISongService";
import { ActivationService, AuthService, SessionService, UserService } from "@/services";
import { Song } from "@/common/types";
import { ResourcesService } from "@/services/ResourcesService";
import { MailingService } from "@/services/MailingService";

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
export type ResetPasswordCredential = Credential & { createdAt: Date, active: boolean };
export type User = {
  id: string;
  internalTag: string;
  nick?: string;
  email: string;
  password?: string;
  status: UserStatus;
  role: Role;
  credentials?: Credential;
  resetPassword?: ResetPasswordCredential;
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
  role: Role;
  internalTag: string;
  password?: string;
}
export type Role = 'superAdmin' | 'admin' | 'user' | 'recruiter' | 'test';
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

export interface BaseProps {
  title: string;
}
export interface LoginErrors {
  email?: string;
  password?: string;
  general?: string;
}
export interface LoginProps extends BaseProps {
  buttonText: string;
  errors?: LoginErrors
  email?: string;
  action: string;
}
export interface Action {
  name: string;
  url: string;
}
export interface ForgotPassword extends Omit<LoginProps, 'errors'> {
  errors: Omit<LoginErrors, 'password'>
}

export interface DashboardProps extends BaseProps {
  actions: Action[];
}
export interface MsgProps extends BaseProps {
  message: string;
  header?: string
  link?: {
    to: string;
    text: string;
  },
  form?: {
    action: string;
    text: string;
    submitText: string;
    token?: string;
  }
}
export interface PasswordPairErrors extends Omit<LoginErrors, 'email'> {
  matchPassword?: string;
}
export interface SetNewPasswordProps extends Omit<LoginProps, 'errors'> {
  token?: string;
  errors?: PasswordPairErrors
}
export interface CreateAccountErrors extends LoginErrors {
  matchPassword: string;
  nick: string;
}
export interface CreateAccountProps extends Omit<SetNewPasswordProps, 'errors'> {
  errors?: CreateAccountErrors
}
export type ViewPropsMap = {
  'authenticate': LoginProps;
  'createAccount': CreateAccountProps;
  'dashboard': DashboardProps;
  'forgotPassword': ForgotPassword;
  'msg': MsgProps;
  'setNewPassword': SetNewPasswordProps;
}
export type ViewPath = keyof ViewPropsMap;

export type SsrConstructorProps = {
  authService: AuthService,
  resourcesService: ResourcesService,
  mailService: MailingService,
  userService: UserService,
  sessionService: SessionService,
  activationService: ActivationService
}


