import { ISongService } from "@/interfaces";
import { IAuthService } from "@/interfaces/IAuthService";
import { IUserService } from "@/interfaces/IUserService";
import { User } from "@/types/types";


export interface ServiceContainer {
  auth: Partial<IAuthService>;
  songs: Partial<ISongService>;
  users: Partial<IUserService>;

}
export interface BaseContext {
  user?: User;
  services: Partial<ServiceContainer>
  metadata: {
    deviceInfo: string;
    appVersion: string;
  }
}

export interface MusicContext extends Omit<BaseContext, 'services'> {
  services: {
    songs: Pick<ISongService, 'search' | 'getRelatedSongs'>;
  };
}

export interface UserContext extends Omit<BaseContext, 'services'> {
  services: {
    users: Pick<IUserService, 'getUserById'>;
    auth: Pick<IAuthService, 'checkUserPassword'>;
  }
}

export interface LoginContext extends Omit<BaseContext, 'services'> {

  services: {
    auth: Pick<IAuthService, 'login'>;
  };

}
export interface RefreshContext extends Omit<BaseContext, 'services'> {
  services: {
    auth: Pick<IAuthService, 'refreshTokens'>;
  }
}
export interface LogoutContext extends Omit<BaseContext, 'services'> {
  services: {
    auth: Pick<IAuthService, 'logout'>;
  }
}