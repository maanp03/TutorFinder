jest.setTimeout(30000);

// Force test mode
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'testsecret';
process.env.MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/tf_test';

jest.mock('../config/database', () => {
  return jest.fn(async () => {
    // no-op during tests
  });
});

// Prevent accidental exits from killing Jest
jest.spyOn(process, 'exit').mockImplementation((code) => {
  throw new Error(`process.exit called with ${code}`);
});
