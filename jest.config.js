// For a detailed explanation regarding each configuration property, visit:
// https://jestjs.io/docs/en/configuration.html

module.exports = {
  automock: false,

  // Indicates whether the coverage information should be collected while executing the test
  collectCoverage: true,

  // The directory where Jest should output its coverage files
  coverageDirectory: "coverage",

  // An object that configures minimum threshold enforcement for coverage results
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 50,
      lines: 70,
      statements: 70,
    },
  },

  // Make calling deprecated APIs throw helpful error messages
  errorOnDeprecated: true,

  // Activates notifications for test results
  notify: false,

  // An enum that specifies notification mode. Requires { notify: true }
  notifyMode: "change",

  // The test environment that will be used for testing
  testEnvironment: "node",
}
