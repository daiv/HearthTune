import { AuthPayload, SignedUrl } from "@/common/types"
import { gqlManager } from "@/graphql/GraphQLClientManager";
import { LOGIN_MUTATION, LOGOUT_MUTATION, REFRESH_MUTATION } from "@/graphql/mutations";
import { GET_SIGNED_URL } from "@/graphql/queries";
import { getDeviceInfo } from "@/helpers/helpers"

export const loginService = async (email: string, password: string, deviceId: string): Promise<AuthPayload> => {
  const deviceInfo = getDeviceInfo();
  const data = await gqlManager.request<{ login: AuthPayload }>(LOGIN_MUTATION, {
    email, password, deviceId, deviceInfo
  });
  return data.login;
}

export const refreshService = async (token: string): Promise<AuthPayload> => {
  const data = await gqlManager.request<{ refreshTokens: AuthPayload }>(REFRESH_MUTATION, { jti: token });
  return data.refreshTokens;
}
export const logoutService = async (jti: string): Promise<boolean> => {
  const data = await gqlManager.safeRequest<boolean>(LOGOUT_MUTATION, { jti });
  return data;
}
export const getSignedUrlService = async (songId: string, provider: string): Promise<SignedUrl> => {
  const data = await gqlManager.safeRequest<{ getSignedUrl: SignedUrl }>(GET_SIGNED_URL, { songId, provider });
  return data.getSignedUrl;
}
