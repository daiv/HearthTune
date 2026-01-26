import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { RequestDocument, Variables } from "graphql-request";
import { request } from "graphql-request";
import { GRAPHQL_API_URL } from "@env";

type GraphQLQueryKey<TVariables> = readonly [string | RequestDocument, TVariables];

export function useGraphQl<TResponse, TVariables extends Variables>(
  query: RequestDocument,
  variables: TVariables,
  options?: Omit<UseQueryOptions<TResponse, Error, TResponse, GraphQLQueryKey<TVariables>>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: [query, variables] as const,
    queryFn: ({ queryKey }) => {
      const [doc, vars] = queryKey;
      return request<TResponse>(GRAPHQL_API_URL, doc, vars);
    },
    ...options
  });

}