module.exports = {
  testEnvironment: "node",
  transform: {
    "^.+\\.js$": "babel-jest",
  },
  coverageDirectory: "./coverage",
  collectCoverage: true,
};
