"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";

function shouldRetryQuery(failureCount: number, error: unknown) {
  if (failureCount >= 2) return false;

  if (error instanceof TypeError) return true;

  const message =
    error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();

  return ["failed to fetch", "network", "timeout", "load failed"].some((text) =>
    message.includes(text),
  );
}

export function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            refetchOnWindowFocus: false,
            refetchOnReconnect: true,
            retry: shouldRetryQuery,
            retryDelay: (attempt) => Math.min(500 * 2 ** attempt, 2_000),
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
