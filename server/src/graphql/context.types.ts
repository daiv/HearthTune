import { ILikeService, IAuthService, ISongService, IUserService, IPLaylistService } from "@/interfaces";
import { User } from "@/types/types";

export interface ServiceContainer {
  auth: IAuthService;
  song: ISongService;
  user: IUserService;
  like: ILikeService;
  playlist: IPLaylistService;
}

export interface BaseContext {
  user?: User;
  services: { [K in keyof ServiceContainer]?: Partial<ServiceContainer[K]> }
  metadata: {
    deviceInfo: string;
    appVersion: string;
  }
}

export interface MusicContext extends Omit<BaseContext, 'services'> {
  services: {
    song: Pick<ISongService, 'search' | 'getRelatedSongs' | 'searchLocally'>;
  };
}

export interface UserContext extends Omit<BaseContext, 'services'> {
  services: {
    user: Pick<IUserService, 'setUserNick' | 'setUserPassword'>;
    auth: Pick<IAuthService, 'checkUserPassword'>;
    like: Pick<ILikeService, 'toggleLike' | 'isLiked' | 'getLikedSongsByUser'>
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
  services: BaseContext['services'] & {
    auth: Pick<IAuthService, 'logout'>;
  }
}

export interface SignUrlContext extends Omit<BaseContext, 'services'> {
  services: {
    auth: Pick<ServiceContainer['auth'], 'createSignedUrl'>
  }
}

export interface GetPlaylistsContext extends Omit<BaseContext, 'services'> {
  services: {
    playlist?: Pick<IPLaylistService, 'getPlaylistById' | 'getPlaylistsByUserId'>;
  }
}

export interface GetSongsContext extends Omit<BaseContext, 'services'> {
  services: {
    song: Pick<ISongService, 'getSongsByIds'>;
  }
}

export interface SavePlaylistContext extends Omit<BaseContext, 'services'> {
  services: {
    playlist?: Pick<IPLaylistService, 'getPlaylistsByUserId' | 'savePlaylist'>;
  };
}

export interface DeletePlaylistContext extends Omit<BaseContext, 'services'> {
  services: {
    playlist?: Pick<IPLaylistService, 'removePlaylist'>;
  }
}
