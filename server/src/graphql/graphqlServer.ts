import { ApolloServer } from "@apollo/server";
import { ExpressContextFunctionArgument, expressMiddleware } from "@as-integrations/express5";
import { join } from "node:path";
import { readFileSync } from 'node:fs'
import { initGraphqlMiddlewareProps, resolverContext, User } from "@/types/types";
import { resolvers } from './resolvers';
import { InvalidCredentialsException } from '@/errors/ServerError';
import { handleGraphQlError } from '@/middleware/handleGraphQLError';

const schemaPath = join(process.cwd(), "src/graphql/schema.graphql");
const typeDefs = readFileSync(schemaPath, "utf-8");

const server = new ApolloServer<resolverContext>({
  typeDefs,
  resolvers,
  formatError: (formattedError, error) => {

    if (process.env.NODE_ENV === 'production')
      delete formattedError.extensions?.stacktrace;
    return formattedError;
  }
});

export async function initGraphqlMiddleware(
  {
    songService,
    userService,
    authService,
    likeService,
    playlistService,
    customContext
  }
    : initGraphqlMiddlewareProps) {

  await server.start();
  return expressMiddleware(server, {
    context: customContext || (async ({ req }: ExpressContextFunctionArgument): Promise<resolverContext> => {
      const authHeader = req.headers.authorization || '';
      const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : authHeader;
      const metadata = {
        deviceInfo: (req.headers['x-device-info'] as string || 'Unknown'),
        deviceId: (req.headers['x-device-id'] as string),
        appVersion: (req.headers['x-app-version'] as string || '0.0.0'),
      };
      let user: User | undefined;
      const operationName = req.body.operationName;
      const isOperationLoginOrRefresh =
        operationName === 'Login' ||
        operationName === 'Refresh';
      console.log('operationName is ', operationName);

      if (token && !isOperationLoginOrRefresh) {
        const payload = authService.isAccessTokenValid(token);
        if (!payload) {
          console.warn("Auth failed:", "invalid Token");
          return handleGraphQlError(new InvalidCredentialsException());
        }
        user = await userService.getUserById(payload.userId);
      }
      return (
        {
          user,
          services: {
            song: songService, user: userService, auth: authService, like: likeService, playlist: playlistService
          },
          metadata,
        }
      );
    })
  });
}