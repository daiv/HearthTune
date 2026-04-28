import { PropsWithChildren, useState } from "react";
import { PlayerProvider } from "./PlayerProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export function ProviderWrapper({ children }: PropsWithChildren) {
  const [queryClient] = useState(() => new QueryClient());
  const providers =
    [
      ({ children }: PropsWithChildren) => (<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>),
      PlayerProvider,
    ];

  return providers.reduceRight((acc, Provider) => <Provider>{acc}</Provider>, children);
}