import type { CodegenConfig } from "@graphql-codegen/cli";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

const config: CodegenConfig = {
  schema: `${API_URL}/graphql`,
  overwrite: true,
  documents: "src/graphql/**/*.graphql",

  generates: {
    "src/generated/graphql.tsx": {
      plugins: [
        {
          add: {
            content: "/* eslint-disable */\n// @ts-nocheck",
          },
        },
        "typescript",
        "typescript-operations",
        "typed-document-node",
      ],
      overwrite: true,
      config: {
        avoidOptionals: {
          field: true,
          inputValue: false,
        },

        defaultScalarType: "any",
        // nonOptionalTypename: true,
        // skipTypeNameForRoot: true,
      },
    },
  },
};

export default config;
