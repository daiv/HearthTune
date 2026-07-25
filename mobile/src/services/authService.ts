import { AuthPayload } from "@/common/types"
import { gqlClient, setTokenRefreshHandler } from "@/graphql/client";
import { LOGIN_MUTATION, REFRESH_MUTATION } from "@/graphql/mutations";
import { getDeviceInfo } from "@/helpers/helpers"

export const loginService = async (email: string, password: string): Promise<AuthPayload> => {
  const deviceInfo = getDeviceInfo();
  const data = await gqlClient.request<{ login: AuthPayload }>(LOGIN_MUTATION, {
    email, password, deviceInfo
  });
  return data.login;
}

export const refreshService = async (token: string): Promise<AuthPayload> => {
  const data = await gqlClient.request<{ refreshTokens: AuthPayload }>(REFRESH_MUTATION, { jti: token });
  return data.refreshTokens;
}

setTokenRefreshHandler(refreshService);
