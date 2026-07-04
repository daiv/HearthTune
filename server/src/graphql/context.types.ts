import { ISongService } from "@/interfaces";
import { IAuthService } from "@/interfaces/IAuthService";
import { IUserService } from "@/interfaces/IUserService";
import { User } from "@/types/types";

export interface BaseContext {
  user?: User;
}

export interface MusicContext extends BaseContext {
  services: {
    songs: Pick<ISongService, 'search' | 'getRelatedSongs'>;
  };
}

export interface UserContext extends BaseContext {
  services: {
    users: Pick<IUserService, 'getUserById'>;
    auth: Pick<IAuthService, 'checkUserPassword'>;
  }
}

export interface LoginContext extends BaseContext {

  services: {
    auth: Pick<IAuthService, 'login'>;
  }
}