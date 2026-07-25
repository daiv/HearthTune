import { useMutation, useQueryClient } from "@tanstack/react-query";
import { RequestDocument, Variables } from "graphql-request";
import { safeRequest } from "@/graphql/client";

export function useGraphQlMutation<TResponse, Tvariables extends Variables>(
  mutation: RequestDocument,
  queryToInvalidate?: string[]
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (variables: Tvariables) => {
      return safeRequest<TResponse>(mutation, { ...variables })
    },
    onSuccess: () => {
      if (queryToInvalidate) queryClient.invalidateQueries({ queryKey: queryToInvalidate })
    }
  })
}