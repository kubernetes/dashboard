const tsJestPreset = require('jest-preset-angular/jest-preset').globals['ts-jest'];

module.exports = {
  verbose: true,
  preset: 'jest-preset-angular',
  rootDir: '../src/app/frontend',
  setupFilesAfterEnv: ["<rootDir>/test.base.ts"],
  globals: {
    "ts-jest": {
      tsconfig: "aio/tsconfig.spec.json",
    }
  }
};
