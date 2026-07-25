import { AuthPayload } from "@/common/types";
import { GRAPHQL_API_URL } from "@env";
import { ClientError, GraphQLClient, RequestDocument, Variables } from "graphql-request";

type RefreshHandler = (token: string) => Promise<AuthPayload>;
class GraphQLClientManager {

  private client: GraphQLClient;
  private tokens: AuthPayload | null = null;
  private refreshTokenHandler: RefreshHandler | null = null;
  private refreshPromise: Promise<AuthPayload> | null = null;
  constructor() {
    this.client = new GraphQLClient(GRAPHQL_API_URL);
  }
  public setAuthToken(tokens: AuthPayload | null, deviceId?: string) {
    this.tokens = tokens;

    this.client.setHeader('Authorization',
      tokens?.accessToken
        ?
        `Bearer ${tokens.accessToken}`
        :
        '');

    if (deviceId) this.client.setHeader('x-device-id', deviceId);
  }
  
  public setTokenRefreshHandler(handler: RefreshHandler) {
    this.refreshTokenHandler = handler;
  }
  public getAuthTokens() {
    return this.tokens;
  }
  public async safeRequest<T>(
    query: RequestDocument,
    variables: Variables,
  ): Promise<T> {
    try {
      return await this.client.request<T>(query, variables);
    } catch (error: unknown) {
      if (error instanceof ClientError) {
        const isUnauthorized = error.response.status === 401 ||
          error.response.errors?.some(e => e.extensions?.code === 'UNAUTHENTICATED');
        if (isUnauthorized) {
          if (!this.refreshTokenHandler || !this.tokens?.refreshToken) throw error;
          try {
            if (!this.refreshPromise)
              this.refreshPromise = this.refreshTokenHandler(this.tokens.refreshToken)
                .finally(() => { this.refreshPromise = null; });

            const newTokens = await this.refreshPromise;
            if (!newTokens) throw error;
            this.setAuthToken(newTokens);
            return await this.client.request<T>(query, variables);
          } catch (refreshError) {
            throw refreshError;
          }
        }
      }
      throw error;
    }
  }
  public async request<T>(
    query: RequestDocument,
    variables: Variables,
  ): Promise<T> {
    return this.client.request<T>(query, variables);
  }
}
export const gqlManager = new GraphQLClientManager();