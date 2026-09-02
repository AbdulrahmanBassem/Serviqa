import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // Data stays fresh for 5 minutes
      retry: 2, // Retry failed network requests twice before showing an error
      refetchOnWindowFocus: false, // Prevents unnecessary reads when switching tabs
    },
  },
});