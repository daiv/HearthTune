import { GraphQLFieldResolver } from "graphql";
import { handleGraphQlError } from "./handleGraphQLError";
import { BaseContext } from "@/graphql/context.types";
import { ForbiddenException, InvalidTokenException } from "@/errors/ServerError";
import { Role } from "@/types/types";

export const protect = <TSource, TContext extends BaseContext, TArgs>(
  check: (role: Role) => boolean,
  fn: GraphQLFieldResolver<TSource, TContext, TArgs>,
): GraphQLFieldResolver<TSource, TContext, TArgs> => {

  return async (parent, args, context, info) => {
    if (!context.user) throw new InvalidTokenException();
    if (!check(context.user.role)) throw new ForbiddenException();
    try {
      return await fn(parent, args, context, info);
    } catch (error: unknown) {
      handleGraphQlError(error);
      throw error;
    }
  };
};