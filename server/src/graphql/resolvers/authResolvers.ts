import { graphQLErrorWrapper } from "@/middleware/graphQLErrorWrapper";
import { LoginContext, RefreshContext } from "../context.types";

export const authResolvers = {
  Mutation: {
    login: async (_parent: undefined, { email, password, deviceInfo }: { email: string, password: string, deviceInfo: string }, context: LoginContext) => {
      return await graphQLErrorWrapper(async () => {
        const { appVersion } = context.metadata;
        return await context.services.auth.login(email, password, deviceInfo);
      });
    },
    refreshTokens: async (_parent: undefined, { token }: { token: string }, context: RefreshContext) => {
      return await graphQLErrorWrapper(async () => {
        return await context.services.auth.refreshTokens(token);
      });
    },
  }
};