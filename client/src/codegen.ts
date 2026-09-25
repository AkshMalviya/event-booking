import type { CodegenConfig } from "@graphql-codegen/cli";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

const config: CodegenConfig = {
  schema: `${API_URL}/graphql`,
  overwrite: true,
  documents: "src/graphql/**/*.graphql",
  generates: {
    "src/generated/": {
      preset: "client",
      config: {
        avoidOptionals: {
          field: true,
          inputValue: false,
        },
        defaultScalarType: "unknown",
        nonOptionalTypename: true,
        skipTypeNameForRoot: true,
        scalars: {
          DateTime: "string",
          Date: "string",
        },
      },
    },
  },
};

export default config;
