// Copyright 2017 The Kubernetes Authors.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

const config = {
  rootDir: './src',
  coverageDirectory: '../../../.tmp',
  preset: "jest-preset-angular/presets/defaults",
  setupFilesAfterEnv: ["<rootDir>/test.base.ts"],
  transform: {
    '^.+\\.(ts|tsx|js|html|svg|mjs)$': [
      'jest-preset-angular', {
        tsconfig: 'tsconfig.spec.json',
        useESM: true,
        stringifyContentPathRegex: '\\.(html|svg)$',
      }
    ]
  },
  moduleNameMapper: {
    "^@api/(.*)$": "<rootDir>/typings/$1",
    "^@common/(.*)$": "<rootDir>/common/$1",
    "^@environments/(.*)$": "<rootDir>/environments/$1",
  },
  transformIgnorePatterns: [
    "/node_modules/(?!(.*))"
  ],
};

export default config;
