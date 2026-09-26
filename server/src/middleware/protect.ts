import { GraphQLFieldResolver } from "graphql";
import { handleGraphQlError } from "./handleGraphQLError";
import { BaseContext } from "@/graphql/context.types";
import { ForbiddenException, InvalidTokenException } from "@/errors/ServerError";
import { ProtectOptions, Role } from "@/types/types";
import { sanitize } from "@/helpers";


export const protect = <TSource, TContext extends BaseContext, TArgs>(
  check: (role: Role) => boolean,
  fn: GraphQLFieldResolver<TSource, TContext, TArgs>,
  options?: ProtectOptions,
): GraphQLFieldResolver<TSource, TContext, TArgs> => {

  return async (parent, args, context, info) => {
    try {
      if (!context.user) throw new InvalidTokenException();
      if (!check(context.user.role)) throw new ForbiddenException();
      const fields = options?.sanitizeFields;
      if (fields && args && typeof args === 'object') {
        const mutableArgs = args as Record<string, unknown>;
        fields.forEach(field => {
          if (field in mutableArgs && typeof mutableArgs[field] === 'string') {
            mutableArgs[field] = sanitize(mutableArgs[field]);
          }
        });
      }
      return await fn(parent, args, context, info);
    } catch (error: unknown) {
      console.error('protect crash', error);
      handleGraphQlError(error);
      throw error;
    }
  };
};