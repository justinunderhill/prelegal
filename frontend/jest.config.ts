import type { Config } from "jest";

const config: Config = {
  testEnvironment: "jsdom",
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        tsconfig: "tsconfig.json",
        jsx: "react-jsx",
      },
    ],
  },
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
  },
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  transformIgnorePatterns: [
    "node_modules/(?!(react-markdown|rehype-raw|rehype-sanitize|hast-util-sanitize|hast-util-raw|unified|remark-parse|remark-rehype|mdast-util-to-hast|micromark|devlop|unist-|vfile|bail|is-plain-obj|trough|property-information|hast-util-|mdast-util-|ccount|escape-string-regexp|markdown-table|zwitch|longest-streak|web-namespaces|comma-separated-tokens|space-separated-tokens|trim-lines)/)",
  ],
  testPathIgnorePatterns: ["<rootDir>/.next/", "<rootDir>/node_modules/"],
};

export default config;
