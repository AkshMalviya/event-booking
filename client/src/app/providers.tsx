"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider } from "react-redux";
import { MantineProvider } from "@mantine/core";
import { store } from "@/store/store";
import { Notifications } from "@mantine/notifications";
import { ModalsProvider } from "@mantine/modals";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
});

export function Providers({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <QueryClientProvider client={queryClient}>
      <MantineProvider>
        <Notifications position="top-right" />
        <ModalsProvider>
          <Provider store={store}>{children}</Provider>
        </ModalsProvider>
      </MantineProvider>
    </QueryClientProvider>
  );
}
