import { AuthPayload } from "@/common/types"
import { gqlManager } from "@/graphql/GraphQLClientManager";
import { LOGIN_MUTATION, REFRESH_MUTATION } from "@/graphql/mutations";
import { getDeviceInfo } from "@/helpers/helpers"

export const loginService = async (email: string, password: string): Promise<AuthPayload> => {
  const deviceInfo = getDeviceInfo();
  const data = await gqlManager.request<{ login: AuthPayload }>(LOGIN_MUTATION, {
    email, password, deviceInfo
  });
  return data.login;
}

export const refreshService = async (token: string): Promise<AuthPayload> => {
  const data = await gqlManager.request<{ refreshTokens: AuthPayload }>(REFRESH_MUTATION, { jti: token });
  return data.refreshTokens;
}

