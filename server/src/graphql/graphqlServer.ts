import { ApolloServer } from "@apollo/server";
import { resolvers } from './resolvers';
import { expressMiddleware } from "@as-integrations/express5";
import { join } from "node:path";
import { readFileSync } from 'node:fs'
import { ISongService } from "../interfaces/ISongService";
import { resolverContext } from "../types/types";

const schemaPath = join(process.cwd(), "src/graphql/schema.graphql");
const typeDefs = readFileSync(schemaPath, "utf-8");

const server = new ApolloServer<resolverContext>({ typeDefs, resolvers });

export async function initGraphqlMiddleware(songService: ISongService) {
  await server.start();
  return expressMiddleware(server, { context: async () => ({ songService }) });
}