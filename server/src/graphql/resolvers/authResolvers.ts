import { graphQLErrorWrapper } from "@/middleware/graphQLErrorWrapper";
import { LoginContext, LogoutContext, RefreshContext, SignUrlContext } from "../context.types";
import { protect } from "@/middleware/protect";
import { atLeast } from "@/helpers";
import { AuthPayload, SignedUrl } from "@/common/types";

export const authResolvers = {
  Query: {
    getSignedUrl: protect(
      atLeast('basic'),
      async (_parent: undefined, { songId, provider }: { songId: string, provider: string }, context: SignUrlContext)
        : Promise<SignedUrl> => {
        const { id } = context.user!;
        console.log('songId', songId);
        console.log('provider', provider);
        console.log('userId', id);
        const signedUrl: SignedUrl = await context.services.auth.createSignedUrl(songId, provider, id);
        return signedUrl;
      }
    )
  },

  Mutation: {

    login: async (
      _parent: undefined,
      { email,
        password,
        deviceId,
        deviceInfo }:
        {
          email: string,
          password: string,
          deviceId: string,
          deviceInfo: string
        }, context: LoginContext)
      : Promise<AuthPayload> => {
      return await graphQLErrorWrapper(async () => {
        const { appVersion } = context.metadata;
        console.log('appversion', appVersion);
        return await context.services.auth.login(email, password, deviceId, deviceInfo);
      });
    },
    refreshTokens: async (_parent: undefined, { token }: { token: string }, context: RefreshContext)
      : Promise<AuthPayload> => {
      return await graphQLErrorWrapper<AuthPayload>(async () => {
        return await context.services.auth.refreshTokens(token);
      });
    },

    logout: protect(
      atLeast('basic'),
      async (_parent: undefined, { jti }: { jti: string }, context: LogoutContext)
        : Promise<boolean> => {
        const result = await context.services.auth.logout(jti);
        return result;
      })
    ,

  }
};