import { GraphQLFieldResolver } from "graphql";
import { handleGraphQlError } from "./handleGraphQLError";
import { BaseContext } from "@/graphql/context.types";
import { InvalidTokenException } from "../errors/ServerError";

export const protect = <TSource, TContext extends BaseContext, TArgs>(
  fn: GraphQLFieldResolver<TSource, TContext, TArgs>
): GraphQLFieldResolver<TSource, TContext, TArgs> => {

  return async (parent, args, context, info) => {
    if (!context.user) throw new InvalidTokenException();

    try {
      return await fn(parent, args, context, info);
    } catch (error: unknown) {
      handleGraphQlError(error);

      throw error;
    }
  };
};