import { ServerError } from "../errors/ServerError";
import { GraphQLError } from "graphql/error";

export const handleGraphQlError = (error: unknown) => {
  if (error instanceof ServerError) {
    throw new GraphQLError(error.message, {
      extensions: {
        code: error.constructor.name,
        http: { status: error.statusCode }
      }
    });
  }

  console.error('Unhandled error', error);
  throw new GraphQLError("Internal Server Error", {
    extensions: {
      code: 'Internal Server Error',
      http: { status: 500 }
    }
  });
}