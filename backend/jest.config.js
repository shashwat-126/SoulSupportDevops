module.exports = {
  testEnvironment: "node",
  testMatch: ["**/tests/**/*.test.js"],
  collectCoverageFrom: [
    "src/**/*.js",
    "!src/server.js",
    "!src/app.js",
    "!src/**/*.model.js",
    "!src/config/**",
  ],
  coverageThreshold: {
    global: {
      branches: 5,
      functions: 9,
      lines: 25,
      statements: 25,
    },
  },
  setupFiles: ["<rootDir>/tests/setup.js"],
  testTimeout: 10000,
  verbose: true,
  forceExit: true,
};
