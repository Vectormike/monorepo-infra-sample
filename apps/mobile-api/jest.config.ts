/* eslint-disable */
import type { Config } from 'jest'

const config: Config = {
  displayName: 'api',
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    'global(Setup|Teardown).ts': 'ts-jest',
    '^.+\\.[tj]s$': '@swc/jest',
  },
  globalSetup: './test/globalSetup.ts',
  globalTeardown: './test/globalTeardown.ts',
  moduleFileExtensions: ['ts', 'js', 'html'],
  // throws an error when not commented out
  // besides, not sure we can benefit from code coverage
  // coverageDirectory: '../../coverage/apps/api',
};

export default config;
