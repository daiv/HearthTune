import { graphQLErrorWrapper } from "@/middleware/graphQLErrorWrapper";
import { LoginContext, LogoutContext, RefreshContext } from "../context.types";
import { protect } from "@/middleware/protect";
import { atLeast } from "@/helpers";

export const authResolvers = {
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
        }, context: LoginContext) => {
      return await graphQLErrorWrapper(async () => {
        const { appVersion } = context.metadata;
        console.log('appversion', appVersion);
        return await context.services.auth.login(email, password, deviceId, deviceInfo);
      });
    },
    logout: protect(
      atLeast('basic'),
      async (_parent: undefined, { jti }: { jti: string }, context: LogoutContext) => {
        const result = await context.services.auth.logout(jti);
        return result;
      })
    ,
    refreshTokens: async (_parent: undefined, { token }: { token: string }, context: RefreshContext) => {
      return await graphQLErrorWrapper(async () => {
        return await context.services.auth.refreshTokens(token);
      });
    },
  }
};