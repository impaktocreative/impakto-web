import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Los skills son material de referencia, no código de la app: se copian y
    // se adaptan a src/. Lintearlos ahí sería pedirle a la referencia que
    // cumpla las reglas de un proyecto que todavía no la usó.
    ".claude/skills/**",
  ]),
]);

export default eslintConfig;
