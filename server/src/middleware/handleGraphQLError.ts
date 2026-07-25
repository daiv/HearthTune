import { ServerError } from "../errors/ServerError";
import { GraphQLError } from "graphql/error";

export const handleGraphQlError = (error: unknown): never => {
  if (error instanceof ServerError) {
    throw new GraphQLError(error.message, {
      extensions: {
        code: error.constructor.name,
        http: { status: error.statusCode }
      }
    });
  }
  if (error instanceof GraphQLError) throw error;

  console.error('Unhandled error', error);

  throw new GraphQLError("Internal Server Error", {
    extensions: {
      code: 'INTERNAL_SERVER_ERROR',
      http: { status: 500 }
    }
  });
}