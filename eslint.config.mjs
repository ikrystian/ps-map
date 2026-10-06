import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import unusedImports from "eslint-plugin-unused-imports";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    plugins: {
      "unused-imports": unusedImports,
    },
    rules: {
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": [
        "warn",
        {
          "vars": "all",
          "varsIgnorePattern": "^_",
          "args": "after-used",
          "argsIgnorePattern": "^_",
        },
      ],
    },
    settings: {
      react: {
        version: "19.0.0",
      },
    },
  },
  // Daty i kwoty formatujemy wspólnymi funkcjami z lib/format.ts (F-001) — bez lokalnych kopii.
  {
    ignores: ["lib/format.ts", "lib/ksef.ts"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector:
            "VariableDeclarator[id.name=/^(formatDate|formatDateTime|formatShortDate|formatCurrency)$/], FunctionDeclaration[id.name=/^(formatDate|formatDateTime|formatShortDate|formatCurrency)$/]",
          message: "Użyj formatDate/formatDateTime/formatCurrency z @/lib/format zamiast lokalnej definicji.",
        },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;

