import { ApolloClient, InMemoryCache, from } from "@apollo/client";
import { ErrorLink } from "@apollo/client/link/error";
import { CombinedGraphQLErrors } from "@apollo/client/errors";
import UploadHttpLink from "apollo-upload-client/UploadHttpLink.mjs";

const errorLink = new ErrorLink(({ error }) => {
  if (CombinedGraphQLErrors.is(error)) {
    error.errors.forEach(({ message, extensions }) => {
      if (
        extensions?.code === "UNAUTHENTICATED" ||
        message.includes("Unauthorized")
      ) {
        if (typeof window !== "undefined") {
          const isAuthPage =
            window.location.pathname.startsWith("/login") ||
            window.location.pathname.startsWith("/signup");

          if (!isAuthPage) {
            window.location.href = "/login";
          }
        }
      }
    });
  } else {
    // Network or other error
    const statusCode = (error as { statusCode?: number }).statusCode;
    if (statusCode === 401 || statusCode === 403) {
      if (typeof window !== "undefined") {
        const isAuthPage =
          window.location.pathname.startsWith("/login") ||
          window.location.pathname.startsWith("/signup");

        if (!isAuthPage) {
          window.location.href = "/login";
        }
      }
    }
  }
});

const uploadLink = new UploadHttpLink({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_URL || "http://localhost:4000/graphql",
  headers: {
    "Apollo-Require-Preflight": "true",
  },
  credentials: "include",
});

export const apolloClient = new ApolloClient({
  link: from([errorLink, uploadLink]),
  cache: new InMemoryCache(),
});
