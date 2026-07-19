import jwt from 'jsonwebtoken';
import { ApolloServer } from "@apollo/server";
import { ExpressContextFunctionArgument, expressMiddleware } from "@as-integrations/express5";
import { join } from "node:path";
import { readFileSync } from 'node:fs'
import { ISongService } from "@/interfaces";
import { AccessPayload, resolverContext, User } from "@/types/types";
import { AuthService, UserService } from "@/services";
import { resolvers } from './resolvers';

const schemaPath = join(process.cwd(), "src/graphql/schema.graphql");
const typeDefs = readFileSync(schemaPath, "utf-8");

const server = new ApolloServer<resolverContext>({ typeDefs, resolvers });

export async function initGraphqlMiddleware(
  songService: ISongService,
  userService: UserService,
  authService: AuthService,
  customContext?: (args: ExpressContextFunctionArgument) => Promise<resolverContext>
) {
  await server.start();
  return expressMiddleware(server, {
    context: customContext || (async ({ req }: ExpressContextFunctionArgument): Promise<resolverContext> => {
      const authHeader = req.headers.authorization || '';
      const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : authHeader;
      const metadata = {
        deviceInfo: (req.headers['x-device-info'] as string || 'Unknown'),
        appVersion: (req.headers['x-app-version'] as string || '0.0.0'),
      };
      let user: User | undefined;
      if (token) {
        try {
          const payload = jwt.verify(token, process.env.ACCESS_TOKEN_KEY!) as AccessPayload;
          user = await userService.getUserById(payload.userId);
        } catch (error) {
          console.warn("Auth failed:", error instanceof Error ? error.message : "invalid Token");
        }
      }
      return (
        {
          user,
          services: {
            songs: songService, user: userService, auth: authService,
          },
          metadata,
        }
      );
    })
  });
}