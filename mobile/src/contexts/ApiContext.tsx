import { GraphQLClient } from "graphql-request";
import { createContext, useContext } from "react";

export const ApiContext = createContext<GraphQLClient | null>(null);

export const useApiContext = () => {
  const context = useContext(ApiContext);
  if (context === null)
    throw new Error('useApiContext must be used within a ApiProvider');
  return context;

}