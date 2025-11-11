// Import jest-expo preset to get all default configurations
const jestExpoPreset = require('jest-expo/jest-preset');

module.exports = {
  ...jestExpoPreset,
  setupFilesAfterEnv: ['<rootDir>/__tests__/setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)',
  ],
  testMatch: ['**/__tests__/**/*.test.[jt]s?(x)', '**/?(*.)+(spec|test).[jt]s?(x)'],
  collectCoverageFrom: [
    'app/**/*.{js,jsx,ts,tsx}',
    'components/**/*.{js,jsx,ts,tsx}',
    'contexts/**/*.{js,jsx,ts,tsx}',
    'lib/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
  // Fix for React Native 0.81.5 ESM compatibility issue
  // React Native 0.81.5's jest setup files use ESM/Flow syntax incompatible with Jest's CommonJS environment
  // For pure unit tests (like our validation tests), we don't need RN or Expo native mocking
  // We override setupFiles to empty array to skip both RN and jest-expo setup files
  // This is the proper solution for testing non-React-Native code (utilities, business logic, etc.)
  // If testing React components/native code, you'll need to add proper mocks
  setupFiles: [],
};
