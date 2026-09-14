"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider } from "react-redux";
import { MantineProvider, createTheme } from "@mantine/core";
import { store } from "@/store/store";
import { Notifications } from "@mantine/notifications";
import { ModalsProvider } from "@mantine/modals";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        const errorWithStatus = error as { statusCode?: number };
        // Stop retrying immediately if we get a 503 (Circuit Breaker OPEN)
        if (errorWithStatus?.statusCode === 503) {
          return false;
        }
        // Otherwise, use the standard 3 retries
        return failureCount < 3;
      },
    },
  },
});

const theme = createTheme({
  fontFamily: "var(--font-inter), sans-serif",
});

export function Providers({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <QueryClientProvider client={queryClient}>
      <MantineProvider theme={theme}>
        <Notifications position="top-right" />
        <ModalsProvider>
          <Provider store={store}>{children}</Provider>
        </ModalsProvider>
      </MantineProvider>
    </QueryClientProvider>
  );
}
