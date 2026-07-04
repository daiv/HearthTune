import jwt from 'jsonwebtoken';
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@as-integrations/express5";
import { join } from "node:path";
import { readFileSync } from 'node:fs'
import { ISongService } from "@/interfaces";
import { AccessPayload, resolverContext, User } from "../types/types";
import { AuthService, UserService } from "@/services";
import { resolvers } from './resolvers';

const schemaPath = join(process.cwd(), "src/graphql/schema.graphql");
const typeDefs = readFileSync(schemaPath, "utf-8");

const server = new ApolloServer<resolverContext>({ typeDefs, resolvers });

export async function initGraphqlMiddleware(
  songService: ISongService,
  userService: UserService,
  authService: AuthService,
  customContext?: (req: any) => Promise<resolverContext>
) {
  await server.start();
  return expressMiddleware(server, {
    context: customContext || (async ({ req }): Promise<resolverContext> => {
      const authHeader = req.headers.authorization || '';
      const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : authHeader;
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
          }
        }
      )
    })
  });
}