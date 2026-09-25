"use client";
import { ApolloProvider } from "@apollo/client/react";
import { Provider } from "react-redux";
import { MantineProvider, createTheme } from "@mantine/core";
import { store } from "@/store/store";
import { Notifications } from "@mantine/notifications";
import { ModalsProvider } from "@mantine/modals";
import { apolloClient } from "@/lib/apolloClient";

const theme = createTheme({
  fontFamily: "var(--font-inter), sans-serif",
});

export function Providers({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ApolloProvider client={apolloClient}>
      <MantineProvider theme={theme}>
        <Notifications position="top-right" />
        <ModalsProvider>
          <Provider store={store}>{children}</Provider>
        </ModalsProvider>
      </MantineProvider>
    </ApolloProvider>
  );
}
