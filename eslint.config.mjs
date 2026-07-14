import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const eslintConfig = [
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
  {
    // Explicit: never sync props into state via useEffect (cascading renders).
    // Prefer derived values / event handlers instead.
    rules: {
      "react-hooks/set-state-in-effect": "error",
    },
  },
];

export default eslintConfig;
