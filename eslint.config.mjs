import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import drizzle from "eslint-plugin-drizzle";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    plugins: {
      drizzle,
    },
    rules: {
      "drizzle/enforce-delete-with-where": "error",
      "drizzle/enforce-update-with-where": "error",
    },
  },
  {
    files: ["src/__tests__/mocks/**/*.ts", "src/__tests__/mocks/**/*.tsx"],
    rules: {
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
  {
    files: ["src/app/**/*.tsx", "src/components/**/*.tsx"],
    rules: {
      "react/no-unescaped-entities": "off",
    },
  },
  {
    files: ["src/components/**/*.tsx", "src/app/page.tsx"],
    rules: {
      "@next/next/no-img-element": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "scripts/**",  // One-time migration scripts
  ]),
]);

export default eslintConfig;
