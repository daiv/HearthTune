import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { RequestDocument, Variables } from "graphql-request";
import { safeRequest } from "@/graphql/client";

type GraphQLQueryKey<TVariables> = readonly [RequestDocument, TVariables];

export function useGraphQl<TResponse, TVariables extends Variables>(
  query: RequestDocument,
  variables: TVariables,
  options?: Omit<UseQueryOptions<TResponse, Error, TResponse, GraphQLQueryKey<TVariables>>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: [query, variables] as const,
    queryFn: ({ queryKey }) => {
      const [doc, vars] = queryKey;
      return safeRequest<TResponse>(doc, vars);
    },
    ...options
  });

}