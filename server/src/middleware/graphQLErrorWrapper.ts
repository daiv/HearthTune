import { handleGraphQlError } from "./handleGraphQLError";

export const graphQLErrorWrapper = async <T>(fn: () => Promise<T>): Promise<T> => {
  try {
    return await fn();
  } catch (error: unknown) {
    handleGraphQlError(error);
    throw error;
  }
}