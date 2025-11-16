// Test setup file
require('dotenv').config({ path: '.env.test' });

// Set test environment variables
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key-for-jwt';
process.env.MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/tutorfinder-test';

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

