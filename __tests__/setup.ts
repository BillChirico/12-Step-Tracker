/**
 * Global test setup for Jest
 * This file runs before all tests and configures the testing environment
 */

// Import custom matchers from jest-native
import '@testing-library/jest-native/extend-expect';

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
