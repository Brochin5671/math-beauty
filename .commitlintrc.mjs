/*
 * .mjs extension + package.json "type": "module" both force ESM loading
 * Belt-and-braces: keeps loading correctly under Node 24 module resolution
 * even if either drifts. See https://nodejs.org/api/packages.html#determining-module-system
 *
 * header-max-length raised from the conventional 100 to 120: GitHub appends
 * ` (#NN)` (4-7 chars) to squash-merge subjects, so any PR title >=94 chars
 * trips the default cap on stacked-PR umbrella scans even though the raw
 * title passed validate-pr-title. 120 matches Angular / Nx convention
 * PR titles themselves still get the strict 100-char check at the
 * validate-pr-title job, which sees the raw title without the suffix
 */
export default {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "header-max-length": [2, "always", 120],
  },
};
