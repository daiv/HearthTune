import { handleGraphQlError } from "../../middleware/handleGraphQLError";
import { LoginContext } from "../context.types";

export const authResolvers = {
  Mutation: {
    login: async (_parent: undefined, { email, password }: { email: string, password: string }, context: LoginContext) => {
      try {
        return await context.services.auth.login(email, password);
      } catch (error: unknown) {
        handleGraphQlError(error);
        throw error;
      }
    },
  }
};