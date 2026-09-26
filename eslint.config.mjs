import nextPlugin from "eslint-config-next";

const config = [
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "next-env.d.ts",
      "coverage/**",
      "test-results/**",
      "playwright-report/**",
    ],
  },
  ...nextPlugin,
];

export default config;
