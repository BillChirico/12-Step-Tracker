/**
 * Global test setup for Jest
 * This file runs before all tests and configures the testing environment
 */

// Note: @testing-library/jest-native is deprecated as of v5.4.3
// Use built-in matchers from @testing-library/react-native v12.4+ instead
// For now, we skip importing it to avoid React Native ESM compatibility issues

// Mock console methods to reduce noise in test output
global.console = {
  ...console,
  // Uncomment to suppress console output during tests
  // log: jest.fn(),
  // debug: jest.fn(),
  // info: jest.fn(),
  // warn: jest.fn(),
  error: jest.fn(), // Keep error to catch unexpected errors
};
