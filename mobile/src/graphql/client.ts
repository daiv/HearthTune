import { ClientError, GraphQLClient, RequestDocument, Variables } from 'graphql-request';
import { GRAPHQL_API_URL } from "@env";
import { AuthPayload } from '@/common/types';

export const gqlClient = new GraphQLClient(GRAPHQL_API_URL);

let currentTokens: AuthPayload | null = null;

export const setAuthToken = (tokens: AuthPayload | null) => {
  console.log('old token were', currentTokens);
  console.log('new tokens are', tokens);
  currentTokens = tokens;

  if (tokens?.accessToken) {
    gqlClient.setHeader('Authorization', `Bearer ${tokens.accessToken}`);
  } else {
    gqlClient.setHeader('Authorization', '');
  }
};

type RefreshHandler = (refreshToken: string) => Promise<AuthPayload>;
let refreshTokenHandler: RefreshHandler | null = null;

export const setTokenRefreshHandler = (handler: RefreshHandler) => {
  refreshTokenHandler = handler;
}
export const getAuthTokens = () => currentTokens;

let refreshPromise: Promise<AuthPayload> | null = null;

export const safeRequest = async <T>(
  query: RequestDocument,
  variables: Variables
): Promise<T> => {
  try {
    return await gqlClient.request<T>(query, variables);
  } catch (error: unknown) {
    if (error instanceof ClientError) {
      const isUnauthorized = error.response.status === 401 ||
        error.response.errors?.some(e => e.extensions?.code === 'UNAUTHENTICATED');

      if (isUnauthorized) {
        if (!refreshTokenHandler || !currentTokens?.refreshToken) {
          throw error;
        }

        try {
          if (!refreshPromise) {
            if (!currentTokens?.refreshToken) {
              throw error;
            }
            const tokenToRefresh = currentTokens.refreshToken;

            refreshPromise = refreshTokenHandler(tokenToRefresh).finally(() => {
              refreshPromise = null;
            });
          }

          const newTokens = await refreshPromise;
          if (!newTokens) throw error;

          setAuthToken(newTokens);
          return await gqlClient.request<T>(query, variables);
        } catch (refreshError) {
          // setAuthToken(null);
          throw refreshError;
        }
      }
    }
    throw error;
  }
};