import { gqlManager } from "@/graphql/GraphQLClientManager";
import { useQuery, UseQueryOptions, UseQueryResult } from "@tanstack/react-query";
import { RequestDocument, Variables } from "graphql-request";

type GraphQLQueryKey<TVariables> = readonly [RequestDocument, TVariables, string];
type EmptyVariables = Record<string, never>;
type QueryOptions<TResponse, TVariables> =
  Omit<
    UseQueryOptions<TResponse, Error, TResponse, GraphQLQueryKey<TVariables>>,
    'queryKey' | 'queryFn'>;



export function useGraphQl<TResponse>(
  query: RequestDocument,
  variables?: undefined,
  options?: QueryOptions<TResponse, EmptyVariables>,
  keySuffix?: string,
): UseQueryResult<TResponse, Error>;


export function useGraphQl<TResponse, TVariables extends Variables>(
  query: RequestDocument,
  variables: TVariables,
  options?: QueryOptions<TResponse, TVariables>,
  keySuffix?: string,
): UseQueryResult<TResponse, Error>;

export function useGraphQl<TResponse, TVariables extends Variables>(
  query: RequestDocument,
  variables?: TVariables,
  options?: QueryOptions<TResponse, TVariables>,
  keySuffix: string = '',
) {
  const resolvedVariables: TVariables = (variables ?? {}) as TVariables;

  return useQuery({
    queryKey: [query, resolvedVariables, keySuffix || ''] as const,
    queryFn: ({ queryKey }) => {
      const [doc, vars] = queryKey;
      return gqlManager.safeRequest<TResponse>(doc, vars);
    },
    ...options
  });

}